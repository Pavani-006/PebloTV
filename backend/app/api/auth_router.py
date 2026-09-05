from fastapi import APIRouter, HTTPException, status
from app.schemas.auth import LoginRequest, Token
from app.auth.jwt import create_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])

# Preset demo accounts
USERS = {
    "admin": {"password": "adminpassword", "role": "admin"},
    "editor": {"password": "editorpassword", "role": "editor"}
}

@router.post("/login", response_model=Token)
def login(request: LoginRequest):
    user = USERS.get(request.username)
    if not user or user["password"] != request.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    
    token = create_access_token({"sub": request.username, "role": user["role"]})
    return Token(access_token=token, token_type="bearer", role=user["role"], username=request.username)
