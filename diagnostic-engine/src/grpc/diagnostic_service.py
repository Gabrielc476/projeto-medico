import sys
import os

# Ensure the proto files can be imported if compiled locally
sys.path.append(os.path.join(os.path.dirname(__file__), '../../proto'))

# In a real environment, we'd compile the proto file to python classes
# Here we mock the imports for the TDD structure to be clear
try:
    import diagnostic_pb2
    import diagnostic_pb2_grpc
except ImportError:
    # Mocks for testing without compiled protos
    class diagnostic_pb2_grpc:
        class DiagnosticServiceServicer:
            pass
    class diagnostic_pb2:
        ContextExtractionResponse = None
        SymptomAssessmentResponse = None
        ExtractedFeature = None

from src.nlp.extractor import ClinicalExtractor
from src.math.bayesian_network import DiseaseDiagnosticNetwork
from src.math.vector_space import SymptomVectorizer

class DiagnosticService(diagnostic_pb2_grpc.DiagnosticServiceServicer):
    def __init__(self):
        self.extractor = ClinicalExtractor()
        self.bayesian_network = DiseaseDiagnosticNetwork()
        self.vectorizer = SymptomVectorizer()
        
    def ExtractContext(self, request, context):
        """
        Takes free text, uses scispaCy to extract symptoms, and returns them.
        """
        features = self.extractor.extract_features(request.free_text)
        
        response_features = []
        if diagnostic_pb2.ExtractedFeature:
            for f in features:
                response_features.append(diagnostic_pb2.ExtractedFeature(
                    cui=f["cui"],
                    name=f["name"],
                    is_present=f["is_present"]
                ))
            return diagnostic_pb2.ContextExtractionResponse(features=response_features)
        return {"features": features} # Fallback for uncompiled proto mock

    def AssessSymptoms(self, request, context):
        """
        Takes symptoms and calculates Log-Odds/TF-IDF rankings.
        """
        # Logic to integrate Vector Space and Bayesian Network
        # This is a stub for the gRPC endpoint
        pass
