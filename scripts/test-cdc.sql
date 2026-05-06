INSERT INTO "Patient" (id, name, email, password, "updatedAt") 
VALUES ('test-cdc-001', 'CDC Test Patient', 'cdc@test.com', 'pwd123', CURRENT_TIMESTAMP) 
ON CONFLICT (id) DO UPDATE SET name = 'CDC Test Patient Update', "updatedAt" = CURRENT_TIMESTAMP;
