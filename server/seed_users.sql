-- Seed demo users for TransSmart
INSERT INTO users (email, name, role, status, avatar_url, cost_per_word, agency_id) VALUES
('kishore@example.com', 'Kishore', 'admin', 'Active', 'https://i.pravatar.cc/150?u=kishore', NULL, NULL),
('manohar@example.com', 'Manohar', 'lpm', 'Active', 'https://i.pravatar.cc/150?u=manohar', NULL, NULL),
('contact@depro.com', 'Depro™', 'vendor', 'Active', 'https://i.pravatar.cc/150?u=depro', 0.12, NULL),
('contact@pactera.com', 'Pactera', 'vendor', 'Active', 'https://i.pravatar.cc/150?u=pactera', 0.15, NULL),
('contact@welocalize.com', 'Welocalize', 'vendor', 'Active', 'https://i.pravatar.cc/150?u=welocalize', 0.14, NULL),
('helga.s@depro.com', 'Helga Schmidt', 'translator', 'Active', 'https://i.pravatar.cc/150?u=helga', NULL, 'vendor-depro'),
('pierre.l@depro.com', 'Pierre Laurent', 'translator', 'Active', 'https://i.pravatar.cc/150?u=pierre', NULL, 'vendor-depro'),
('maria.g@pactera.com', 'Maria Garcia', 'translator', 'Active', 'https://i.pravatar.cc/150?u=maria', NULL, 'vendor-pactera'),
('joao.s@pactera.com', 'João Silva', 'translator', 'Invited', 'https://i.pravatar.cc/150?u=joao', NULL, 'vendor-pactera'),
('yuki.t@welocalize.com', 'Yuki Tanaka', 'translator', 'Active', 'https://i.pravatar.cc/150?u=yuki', NULL, 'vendor-welocalize'),
('admin@example.com', 'Demo Admin', 'admin', 'Active', 'https://i.pravatar.cc/150?u=admin@example.com', NULL, NULL),
('vendor@example.com', 'Demo Vendor', 'vendor', 'Active', 'https://i.pravatar.cc/150?u=vendor@example.com', 0.10, NULL),
('translator@example.com', 'Demo Translator', 'translator', 'Active', 'https://i.pravatar.cc/150?u=translator@example.com', NULL, 'user-vendor-demo');
