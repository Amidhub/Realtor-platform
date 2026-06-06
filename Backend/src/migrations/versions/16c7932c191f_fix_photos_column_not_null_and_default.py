"""fix_photos_column_not_null_and_default

Revision ID: 16c7932c191f
Revises: baffc5832295
Create Date: 2026-06-03 18:45:00.408091

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql 


# revision identifiers, used by Alembic.
revision: str = '16c7932c191f'
down_revision: Union[str, Sequence[str], None] = 'baffc5832295'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("UPDATE listings SET photos = '[]'::jsonb WHERE photos IS NULL")
    op.alter_column('listings', 'photos',
    existing_type=postgresql.JSONB(astext_type=sa.Text()),
    nullable=False,
    server_default=sa.text("'[]'::jsonb"))

def downgrade() -> None:
    op.alter_column('listing', 'photos',
                    existing_type=postgresql.JSONB(astext_type=sa.Text()),
                    nullable=True,
                    server_default=None)
