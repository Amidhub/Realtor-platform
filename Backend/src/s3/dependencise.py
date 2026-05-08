from src.s3.client import S3Client
from src.config import setting

def get_s3_client():
    return S3Client(
        access_key=setting.ACCESS_KEY_S3,
        secret_key=setting.SECRET_KEY_S3,
        endpoint_url=setting.ENDPOINT_URl_S3,
        bucket_name=setting.BUCKET_NAME_S3
    )
