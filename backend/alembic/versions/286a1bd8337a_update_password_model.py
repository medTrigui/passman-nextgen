"""update password model

Revision ID: 286a1bd8337a
Revises: d327e50dbec1
Create Date: 2025-06-21 16:49:27.464776

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '286a1bd8337a'
down_revision: Union[str, None] = 'd327e50dbec1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
