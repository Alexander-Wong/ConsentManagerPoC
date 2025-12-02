#!/bin/bash

# Exit on error
set -e

VERSION_TYPE=$1

if [ -z "$VERSION_TYPE" ]; then
  echo "❌ You must pass a version type: patch | minor | major"
  exit 1
fi

echo "📦 Starting $VERSION_TYPE release..."

# Ensure at least some changes are staged
if git diff --cached --quiet; then
  echo "❌ No staged changes found. Stage what you want to release first."
  exit 1
fi

# Stash everything except staged files
echo "📥 Stashing unstaged changes..."
git stash -q --keep-index

STASHED=true

# Determine commit type based on version type
case $VERSION_TYPE in
  major)
    COMMIT_TYPE="feat"
    COMMIT_PREFIX="feat!:"
    echo "🚀 MAJOR release - Breaking changes"
    ;;
  minor)
    COMMIT_TYPE="feat"
    COMMIT_PREFIX="feat:"
    echo "✨ MINOR release - New features"
    ;;
  patch)
    COMMIT_TYPE="fix"
    COMMIT_PREFIX="fix:"
    echo "🐛 PATCH release - Bug fixes"
    ;;
  *)
    echo "❌ Invalid version type"
    exit 1
    ;;
esac

# Ask developer for the commit message
echo ""
echo "📝 Enter your release commit description (without type prefix):"
echo "   Example: add user authentication feature"
echo "   Will be formatted as: $COMMIT_PREFIX <your description>"
echo ""
read -p "Description: " COMMIT_DESC

# Validate commit description
if [ -z "$COMMIT_DESC" ]; then
  echo "❌ Commit description cannot be empty"
  exit 1
fi

# Build the full commit message
COMMIT_MSG="$COMMIT_PREFIX $COMMIT_DESC"
echo ""
echo "📋 Commit message will be: $COMMIT_MSG"

# Run tests and build
echo "🧪 Running tests..."
npm test

echo "🏗️ Building project..."
npm run build

# Bump version without auto-commit or tag
echo "🔢 Bumping version..."
npm version $VERSION_TYPE --no-git-tag-version

# Generate/update the changelog
echo "📝 Updating CHANGELOG.md..."
npm run changelog:update

# Stage everything for the release commit
git add .

# Create single commit
echo "🔒 Creating release commit..."
git commit -m "$COMMIT_MSG"

# Get new version number
VERSION=$(node -p "require('./package.json').version")

# Tag the release
echo "🏷️ Tagging version v$VERSION..."
git tag "v$VERSION"

# Push commit and tag
echo "📤 Pushing to origin..."
git push
git push --tags

# Restore unstaged changes
if [ "$STASHED" = true ]; then
  echo "📤 Restoring unstaged changes..."
  git stash pop -q || true
fi

echo "🎉 Release v$VERSION completed successfully!"
echo "✔ All unstaged changes restored."
