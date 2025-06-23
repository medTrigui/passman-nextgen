"""Initial migration

Revision ID: d327e50dbec1
Revises: 
Create Date: 2025-06-21 15:45:11.941767

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd327e50dbec1'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('username', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email'),
        sa.UniqueConstraint('username')
    )

    # Create passwords table
    op.create_table(
        'passwords',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('username', sa.String(length=255), nullable=False),
        sa.Column('encrypted_password', sa.LargeBinary(), nullable=False),
        sa.Column('url', sa.String(length=1024), nullable=True),
        sa.Column('notes', sa.String(length=4096), nullable=True),
        sa.Column('tags', sa.JSON(), nullable=True),
        sa.Column('iv', sa.LargeBinary(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_passwords_user_id', 'passwords', ['user_id'])


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index('ix_passwords_user_id', 'passwords')
    op.drop_table('passwords')
    op.drop_table('users')
