from os import getenv
from dotenv import load_dotenv
import libsql

load_dotenv()


class DatabaseConfig:

    def __init__(self, read_only: bool = False) -> None:

        self._db_auth_token = getenv(
            "DATABASE_READ_AUTH_TOKEN" if read_only else "DATABASE_WRITE_AUTH_TOKEN"
        )
        self._db_url = getenv("DATABASE_URL")

        if self._db_auth_token is None:
            raise ValueError(
                "DATABASE_READ_AUTH_TOKEN or DATABASE_WRITE_AUTH_TOKEN is None"
            )

        if self._db_url is None:
            raise ValueError("DATABASE_URL is None")

        self.client = libsql.connect(
            database="./infrastructure/databases/sqlite/local.db",
            sync_url=self._db_url,
            auth_token=self._db_auth_token,
            sync_interval=60,
        )
        self.client.sync()
