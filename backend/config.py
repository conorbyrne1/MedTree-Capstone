from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_USER: str = "root"
    DB_PASSWORD: str = ""
    DB_NAME: str = "medtree"

    JWT_SECRET: str = "-EYLsNTJ/{uWZ$1J:CWJl3Z5H|Er0K21PQ:zjpfnJ&e"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60 * 24 # this lasts for 24 hours

    class Config:
        env_file = ".env"

settings = Settings()
