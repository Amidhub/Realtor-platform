from aiobotocore.session import get_session
from contextlib import asynccontextmanager

from fastapi import UploadFile


class S3Client:
    def __init__(self,
                 access_key: str,
                 secret_key: str,
                 endpoint_url: str,
                 bucket_name: str,
                 ):
        self.config = {
            "aws_access_key_id": access_key,
            "aws_secret_access_key": secret_key,
            "endpoint_url": endpoint_url,
            "verify": False
        }
        self.bucket_name = bucket_name
        self.session = get_session()
    
    @asynccontextmanager    
    async def get_client(self):
        async with self.session.create_client("s3", **self.config) as client:
            yield client
    
    async def upload_file(
        self,
        file: UploadFile,
        key: str
        
    ):
        async with self.get_client() as client:
            
            content = await file.read()
            await client.put_object(
                Bucket=self.bucket_name,
                Key=key,
                Body=content,
                ContentDisposition='inline',
                ContentType=file.content_type,
            )
