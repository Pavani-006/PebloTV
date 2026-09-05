import sys
import os

# Ensure backend root is on Python module search path for pytest
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
