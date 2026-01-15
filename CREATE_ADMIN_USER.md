# How to Create an Admin User

There are several ways to create an admin user in the Carbnb system. Choose the method that works best for your setup.

## Method 1: Update Existing User Role in Database (Recommended)

If you already have a registered user, you can update their role directly in the database.

### Using SQL (PostgreSQL/SQLite):

```sql
-- For PostgreSQL
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';

-- For SQLite (if using SQLite)
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

### Using Python Script:

Create a file `create_admin.py` in the `user_service` directory:

```python
from app.core.database import engine, Session
from app.models.user import User
from sqlmodel import select

def make_user_admin(email: str):
    """Update a user's role to admin."""
    with Session(engine) as session:
        # Find user by email
        user = session.exec(select(User).where(User.email == email)).first()
        
        if not user:
            print(f"User with email {email} not found!")
            return False
        
        # Update role
        user.role = "admin"
        session.add(user)
        session.commit()
        session.refresh(user)
        
        print(f"User {user.email} is now an admin!")
        return True

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python create_admin.py <email>")
        sys.exit(1)
    
    email = sys.argv[1]
    make_user_admin(email)
```

Run it:
```bash
cd newBackend/car-rental-backend-v2/user_service
python create_admin.py your-email@example.com
```

## Method 2: Create Admin User via Registration + Database Update

1. **Register a new user** through the frontend at `/register`
2. **Update the role** using Method 1 above

## Method 3: Direct Database Insert (Advanced)

If you need to create a user directly in the database:

```python
from app.core.database import engine, Session
from app.models.user import User
from app.core.security import get_password_hash
from datetime import datetime

def create_admin_user(email: str, username: str, password: str, first_name: str, last_name: str):
    """Create a new admin user directly."""
    with Session(engine) as session:
        # Check if user already exists
        existing = session.exec(select(User).where(User.email == email)).first()
        if existing:
            print(f"User with email {email} already exists!")
            return False
        
        # Create new admin user
        new_user = User(
            email=email,
            username=username.lower(),
            hashed_password=get_password_hash(password),
            first_name=first_name,
            last_name=last_name,
            role="admin",
            is_active=True,
            is_verified=True,  # Admin users are auto-verified
            created_at=datetime.utcnow()
        )
        
        session.add(new_user)
        session.commit()
        session.refresh(new_user)
        
        print(f"Admin user {email} created successfully!")
        return True
```

## Method 4: Using Database GUI Tool

If you're using a database GUI tool (like pgAdmin, DBeaver, or DB Browser for SQLite):

1. Connect to your database
2. Navigate to the `users` table
3. Find the user you want to make admin
4. Update the `role` field from `"user"` to `"admin"`
5. Save the changes

## Verification

After updating a user's role:

1. **Log out** from the frontend (if logged in)
2. **Log back in** with the updated user account
3. The user data in localStorage will be refreshed with the new role
4. Navigate to `/admin` - you should now have access!

## Important Notes

- **Role values**: Valid roles are `"user"`, `"admin"`, or `"super_admin"`
- **Token refresh**: After updating the role, the user needs to log out and log back in to get a new JWT token with the updated role
- **Security**: Only users with `admin` or `super_admin` roles can access `/admin`
- **First admin**: You'll need to create the first admin user using one of the methods above (typically Method 1 or 2)

## Troubleshooting

If you still can't access `/admin` after updating the role:

1. **Clear browser storage**: Clear localStorage and cookies
2. **Log out and log back in**: This refreshes the JWT token with the new role
3. **Check the token**: The JWT token contains the role, so it needs to be regenerated
4. **Verify in database**: Double-check that the role was actually updated in the database

