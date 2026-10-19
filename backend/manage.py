
#!/usr/bin/env python
import os
import sys
from pathlib import Path


def main():
    """Run Django management commands."""
    backend_dir = Path(__file__).resolve().parent
    src_dir = backend_dir / "src"

    if str(src_dir) not in sys.path:
        sys.path.insert(0, str(src_dir))

    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Make sure it is installed "
            "and your virtual environment is activated."
        ) from exc

    execute_from_command_line(sys.argv)


if __name__ == "__main__":
    main()
