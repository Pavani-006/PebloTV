import os
import uuid
from typing import BinaryIO
from app.storage.base import StorageAdapter
from app.config import settings

class R2Storage(StorageAdapter):
    """
    Cloudflare R2 Object Storage Adapter (S3 API compatible).
    Falls back gracefully if boto3 is not installed or configured.
    """
    def __init__(self):
        try:
            import boto3
            self.s3 = boto3.client(
                "s3",
                endpoint_url=settings.R2_ENDPOINT_URL,
                aws_access_key_id=settings.R2_ACCESS_KEY_ID,
                aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY
            )
        except Exception:
            self.s3 = None
        self.bucket = settings.R2_BUCKET_NAME
        self.domain = settings.R2_PUBLIC_DOMAIN

    def save(self, file_obj: BinaryIO, filename: str) -> str:
        ext = os.path.splitext(filename)[1].lower()
        storage_key = f"artwork/{uuid.uuid4().hex}{ext}"
        if self.s3:
            self.s3.upload_fileobj(file_obj, self.bucket, storage_key)
        return storage_key

    def get_url(self, storage_key: str) -> str:
        if self.domain:
            return f"https://{self.domain}/{storage_key}"
        return f"/media/{storage_key}"

    def delete(self, storage_key: str) -> bool:
        if self.s3:
            self.s3.delete_object(Bucket=self.bucket, Key=storage_key)
            return True
        return False
