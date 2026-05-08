from fastapi import HTTPException, UploadFile
import magic

KB=1024
MB=KB*1024

ALLOWED_FILE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
}


def check_size_of_file(file: UploadFile):
    file.file.seek(0, 2)
    size = file.file.tell()
    file.file.seek(0)
    if not 0 < size <= 10*MB:
        raise HTTPException(400, "Слишком большой размер файла")

def check_type_of_file(file: UploadFile):
    header = file.file.read(1024)
    file.file.seek(0)
    file_type = magic.from_buffer(header, mime=True)
    if file_type not in ALLOWED_FILE_TYPES:
        raise HTTPException(400, f"Система не поддерживает файл такого типа: {file_type}")
