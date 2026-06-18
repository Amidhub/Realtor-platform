"""add_moderation_logs

Revision ID: baffc5832295
Revises: 1030238de78d
Create Date: 2026-06-02 16:26:30.830508

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'baffc5832295'
down_revision: Union[str, Sequence[str], None] = '1030238de78d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('listings', sa.Column('infrastructure', sa.JSON(), nullable=True))
    op.add_column('listings', sa.Column('investment', sa.JSON(), nullable=True))


def downgrade() -> None:
    op.drop_column('listings', 'investment')
    op.drop_column('listings', 'infrastructure')