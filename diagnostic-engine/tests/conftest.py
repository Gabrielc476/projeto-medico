import pytest
import numpy as np

@pytest.fixture(autouse=True)
def set_random_seed():
    """Ensure stochastic reproducibility across tests."""
    np.random.seed(42)
