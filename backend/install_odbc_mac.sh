#!/bin/bash
# Install ODBC drivers for SQL Server on macOS

echo "Installing Microsoft ODBC Driver 17 for SQL Server on macOS..."
echo "This script requires Homebrew. If you don't have it, install from https://brew.sh"
echo ""

# Check if brew is installed
if ! command -v brew &> /dev/null; then
    echo "❌ Homebrew is not installed. Please install it first:"
    echo "   /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
    exit 1
fi

echo "Adding Microsoft tap..."
brew tap microsoft/mssql-release https://github.com/Microsoft/homebrew-mssql-release

echo ""
echo "Updating Homebrew..."
brew update

echo ""
echo "Installing ODBC Driver 17 for SQL Server..."
# Accept the license automatically
HOMEBREW_NO_ENV_FILTERING=1 ACCEPT_EULA=Y brew install msodbcsql17

echo ""
echo "Installing mssql-tools (optional but recommended)..."
HOMEBREW_NO_ENV_FILTERING=1 ACCEPT_EULA=Y brew install mssql-tools

echo ""
echo "✅ Installation complete!"
echo ""
echo "To verify the installation, run:"
echo "  python test_pyodbc.py"