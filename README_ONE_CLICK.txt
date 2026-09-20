RELIEFLINK - ONE CLICK VERSION (PYTHON 3.14)
===============================================

This package is configured to run with Python 3.14.
You do NOT need to downgrade Python.

Windows:
1. Extract the ZIP completely.
2. Double-click START.bat.
3. Wait for the browser to open.
4. Keep the black server window open while using the site.
5. Close the server window when finished, or use STOP.bat.

Demo accounts:
Coordinator: coordinator@relieflink.demo / demo123
Affected:    affected@relieflink.demo    / demo123
NGO:         ngo@relieflink.demo         / demo123

The previous version pinned an older Pydantic release that could make
Python 3.14 try to build pydantic-core from source. This version uses
Python-3.14-compatible FastAPI/Pydantic versions and tells pip to use
binary wheels, avoiding that source-build failure.

The prototype uses simulated/demo operational data. It is not a live emergency service.
Internet is required the first time because START.bat installs Python packages.
