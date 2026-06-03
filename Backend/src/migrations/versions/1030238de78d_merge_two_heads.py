"""merge_two_heads

Revision ID: 1030238de78d
Revises: 0b2c32be9e2a, 9be58eafa098
Create Date: 2026-05-19 21:57:18.377758

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1030238de78d'
down_revision: Union[str, Sequence[str], None] = ('0b2c32be9e2a', '9be58eafa098')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'moderation_logs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('listing_id', sa.Integer(), nullable=False),
        sa.Column('moderator_id', sa.Integer(), nullable=False),
        sa.Column('action', sa.String(length=20), nullable=False),
        sa.Column('previous_status', sa.String(length=20), nullable=False),
        sa.Column('new_status', sa.String(length=20), nullable=False),
        sa.Column('reason', sa.String(length=500), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text("TIMEZONE('utc', now())"), nullable=False),
        sa.ForeignKeyConstraint(['listing_id'], ['listings.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['moderator_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    op.create_index('ix_moderation_logs_listing_id', 'moderation_logs', ['listing_id'])
    op.create_index('ix_moderation_logs_moderator_id', 'moderation_logs', ['moderator_id'])
    op.create_index('ix_moderation_logs_created_at', 'moderation_logs', ['created_at'])


def downgrade() -> None:
    op.drop_table('moderation_logs')
