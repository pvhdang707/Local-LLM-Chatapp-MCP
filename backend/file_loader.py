import os
import tempfile
import requests
import mimetypes
from langchain_community.document_loaders import (
    PyPDFLoader,
    UnstructuredFileLoader,
    UnstructuredPowerPointLoader,
    UnstructuredExcelLoader
)
from langchain.schema import Document


def load_document_from_url(url: str) -> list[Document]:
    # 1. Tải file về bộ nhớ tạm
    response = requests.get(url)
    if response.status_code != 200:
        raise Exception(f"Failed to download file: {url}")

    content_type = response.headers.get("content-type", "")
    ext = mimetypes.guess_extension(content_type) or ".tmp"

    tmp_file = tempfile.NamedTemporaryFile(delete=False, suffix=ext)
    tmp_file.write(response.content)
    tmp_file.close()

    path = tmp_file.name
    if path.endswith(".pdf"):
        loader = PyPDFLoader(path)
    elif path.endswith(".docx") or path.endswith(".doc"):
        loader = UnstructuredFileLoader(path)
    elif path.endswith(".pptx"):
        loader = UnstructuredPowerPointLoader(path)
    elif path.endswith(".xlsx") or path.endswith(".xls"):
        loader = UnstructuredExcelLoader(path)
    else:
        raise Exception(f"Unsupported file type")

    documents = loader.load()
    os.remove(path)

    return documents