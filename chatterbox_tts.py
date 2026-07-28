"""Chatterbox TTS API - Text-to-speech with voice cloning on Modal."""

import modal

# Modal secret:
# modal secret create backblaze-b2 \
#   B2_REGION=<region> \
#   B2_KEY_ID=<key-id> \
#   B2_APPLICATION_KEY=<application-key> \
#   B2_BUCKET_NAME=<bucket-name>

image = (
    modal.Image.debian_slim(python_version="3.10")
    .uv_pip_install(
        "chatterbox-tts==0.1.6",
        "fastapi[standard]==0.124.4",
        "peft==0.18.0",
        "boto3",
    )
)

app = modal.App("chatterbox-tts", image=image)


with image.imports():
    import io
    import os
    import tempfile

    import boto3
    import torchaudio as ta

    from chatterbox.tts_turbo import ChatterboxTurboTTS

    from fastapi import (
        Depends,
        FastAPI,
        HTTPException,
        Security,
    )

    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import StreamingResponse
    from fastapi.security import APIKeyHeader

    from pydantic import BaseModel, Field


    api_key_scheme = APIKeyHeader(
        name="x-api-key",
        scheme_name="ApiKeyAuth",
        auto_error=False,
    )


    def verify_api_key(
        x_api_key: str | None = Security(api_key_scheme)
    ):
        expected = os.environ.get("CHATTERBOX_API_KEY", "")

        if not expected or x_api_key != expected:
            raise HTTPException(
                status_code=403,
                detail="Invalid API key",
            )

        return x_api_key


    class TTSRequest(BaseModel):
        prompt: str = Field(
            ...,
            min_length=1,
            max_length=5000,
        )

        voice_key: str = Field(
            ...,
            min_length=1,
            max_length=300,
        )

        temperature: float = Field(
            default=0.8,
            ge=0.0,
            le=2.0,
        )

        top_p: float = Field(
            default=0.95,
            ge=0.0,
            le=1.0,
        )

        top_k: int = Field(
            default=1000,
            ge=1,
            le=10000,
        )

        repetition_penalty: float = Field(
            default=1.2,
            ge=1.0,
            le=2.0,
        )

        norm_loudness: bool = Field(
            default=True
        )



@app.cls(
    gpu="a10g",
    scaledown_window=60 * 5,
    secrets=[
        modal.Secret.from_name("hf-token"),
        modal.Secret.from_name("chatterbox-api-key"),
        modal.Secret.from_name("backblaze-b2"),
    ],
)
@modal.concurrent(max_inputs=10)
class Chatterbox:

    @modal.enter()
    def load_model(self):

        self.model = ChatterboxTurboTTS.from_pretrained(
            device="cuda"
        )

        self.b2 = boto3.client(
            "s3",
            region_name=os.environ["B2_REGION"],
            endpoint_url=(
                f"https://s3."
                f"{os.environ['B2_REGION']}."
                f"backblazeb2.com"
            ),
            aws_access_key_id=os.environ["B2_KEY_ID"],
            aws_secret_access_key=os.environ[
                "B2_APPLICATION_KEY"
            ],
        )

        self.bucket = os.environ["B2_BUCKET_NAME"]


    def download_voice(
        self,
        key: str,
    ) -> str:

        tmp = tempfile.NamedTemporaryFile(
            suffix=".wav",
            delete=False,
        )

        self.b2.download_fileobj(
            self.bucket,
            key,
            tmp,
        )

        tmp.flush()

        return tmp.name



    @modal.asgi_app()
    def serve(self):

        web_app = FastAPI(
            title="Chatterbox TTS API",
            description="Text-to-speech with voice cloning",
            docs_url="/docs",
            dependencies=[
                Depends(verify_api_key)
            ],
        )


        web_app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )


        @web_app.post(
            "/generate",
            responses={
                200: {
                    "content": {
                        "audio/wav": {}
                    }
                }
            },
        )
        def generate_speech(
            request: TTSRequest,
        ):

            try:

                voice_path = self.download_voice(
                    request.voice_key
                )


                audio_bytes = self.generate.local(
                    request.prompt,
                    voice_path,
                    request.temperature,
                    request.top_p,
                    request.top_k,
                    request.repetition_penalty,
                    request.norm_loudness,
                )


                return StreamingResponse(
                    io.BytesIO(audio_bytes),
                    media_type="audio/wav",
                )


            except Exception as e:

                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to generate audio: {e}",
                )


        return web_app



    @modal.method()
    def generate(
        self,
        prompt: str,
        audio_prompt_path: str,
        temperature: float = 0.8,
        top_p: float = 0.95,
        top_k: int = 1000,
        repetition_penalty: float = 1.2,
        norm_loudness: bool = True,
    ):

        wav = self.model.generate(
            prompt,
            audio_prompt_path=audio_prompt_path,
            temperature=temperature,
            top_p=top_p,
            top_k=top_k,
            repetition_penalty=repetition_penalty,
            norm_loudness=norm_loudness,
        )


        buffer = io.BytesIO()

        ta.save(
            buffer,
            wav,
            self.model.sr,
            format="wav",
        )

        buffer.seek(0)

        return buffer.read()

    @modal.method()
    def generate_from_b2(
        self,
        prompt: str,
        voice_key: str,
    ):
        voice_path = self.download_voice(
            voice_key
        )

        wav = self.model.generate(
            prompt,
            audio_prompt_path=voice_path,
            temperature=0.8,
            top_p=0.95,
            top_k=1000,
            repetition_penalty=1.2,
            norm_loudness=True,
        )

        buffer = io.BytesIO()

        ta.save(
            buffer,
            wav,
            self.model.sr,
            format="wav",
        )

        buffer.seek(0)

        return buffer.read()



@app.local_entrypoint()
def test(
    prompt: str = "Chatterbox running on Modal [chuckle].",
    voice_key: str = "voices/system/default.wav",
    output_path: str = "/tmp/output.wav",
):
    import pathlib

    chatterbox = Chatterbox()

    audio_bytes = chatterbox.generate_from_b2.remote(
        prompt=prompt,
        voice_key=voice_key,
    )

    output_file = pathlib.Path(output_path)
    output_file.parent.mkdir(parents=True, exist_ok=True)

    output_file.write_bytes(audio_bytes)

    print(f"Audio saved to {output_file}")