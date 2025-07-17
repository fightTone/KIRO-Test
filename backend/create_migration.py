import subprocess
import sys
import os

def create_migration():
    """
    Create an initial Alembic migration
    """
    try:
        # Run alembic revision command
        subprocess.run(
            ["alembic", "revision", "--autogenerate", "-m", "Initial migration"],
            check=True
        )
        print("Migration created successfully!")
    except subprocess.CalledProcessError as e:
        print(f"Error creating migration: {e}")
        sys.exit(1)

if __name__ == "__main__":
    create_migration()