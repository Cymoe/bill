#!/bin/bash

# Script to apply line items migrations to Supabase
# These migrations add template line items for Roofing, Electrical, Plumbing, and HVAC industries

echo "Applying line items migrations to Supabase..."
echo "=========================================="

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

# Check if we're in the right directory
if [ ! -f "$PROJECT_ROOT/package.json" ]; then
    echo "Error: This script must be run from the bills project directory"
    exit 1
fi

# Navigate to project root
cd "$PROJECT_ROOT"

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "Error: Supabase CLI is not installed"
    echo "Please install it from: https://supabase.com/docs/guides/cli"
    exit 1
fi

# List the migrations to be applied
echo ""
echo "The following migrations will be applied:"
echo "1. 20250120_add_roofing_line_items.sql"
echo "2. 20250120_add_electrical_line_items.sql"
echo "3. 20250120_add_plumbing_line_items.sql"
echo "4. 20250120_add_hvac_line_items.sql"
echo ""

# Ask for confirmation
read -p "Do you want to apply these migrations? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Migration cancelled."
    exit 0
fi

# Apply migrations using Supabase CLI
echo ""
echo "Applying migrations..."

# Apply each migration
for migration in \
    "20250120_add_roofing_line_items.sql" \
    "20250120_add_electrical_line_items.sql" \
    "20250120_add_plumbing_line_items.sql" \
    "20250120_add_hvac_line_items.sql"
do
    echo ""
    echo "Applying $migration..."
    supabase db push --db-url "$DATABASE_URL" < "supabase/migrations/$migration"
    
    if [ $? -eq 0 ]; then
        echo "✅ $migration applied successfully"
    else
        echo "❌ Failed to apply $migration"
        echo "Please check the error message above and fix any issues before continuing."
        exit 1
    fi
done

echo ""
echo "=========================================="
echo "✅ All migrations applied successfully!"
echo ""
echo "Next steps:"
echo "1. Test the line items by logging in as a user with one of these industries"
echo "2. Check the Items page in the Price Book to see the new template items"
echo "3. Create migrations for remaining industries if needed"