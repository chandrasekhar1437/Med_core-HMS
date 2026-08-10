from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

# ... keep existing imports above ...

# 2. LOGIN
@router.post("/login")
@router.post("/login/")
async def login(
    payload: Optional[UserLogin] = None,
    form_data: Optional[OAuth2PasswordRequestForm] = Depends(),
):
    try:
        # Resolve email/username from either JSON payload or Form data
        email_raw = ""
        password = ""
        req_role = None

        if payload and payload.email:
            email_raw = payload.email
            password = payload.password
            req_role = payload.role
        elif form_data and form_data.username:
            email_raw = form_data.username
            password = form_data.password

        email = str(email_raw).lower().strip()

        if not email or not password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email and password are required",
            )

        user = await db.users.find_one({"email": email})
        if not user or not verify_password(password, user.get("password_hash", "")):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        user_id = str(user["_id"])
        db_role = user.get("role", "Patient")

        if req_role and normalize_role(req_role) != normalize_role(db_role):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"User exists as '{db_role}' but selected '{req_role}'",
            )

        access_token = create_access_token(
            data={"sub": user_id, "email": user["email"], "role": db_role}
        )

        user_name = user.get("name") or user.get("full_name") or "User"

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user_id,
                "email": user["email"],
                "name": user_name,
                "full_name": user_name,
                "role": db_role,
            },
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        print("\n--- LOGIN ERROR TRACEBACK ---")
        traceback.print_exc()
        print("------------------------------\n")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}",
        )