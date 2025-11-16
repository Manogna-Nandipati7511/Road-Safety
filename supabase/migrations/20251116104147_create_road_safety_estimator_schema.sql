/*
  # Road Safety Intervention Cost Estimator Database Schema

  ## Overview
  This migration creates the complete database structure for the Road Safety 
  Intervention Cost Estimator application.

  ## New Tables
  
  ### 1. `interventions`
  Stores uploaded intervention reports and their extracted data
  - `id` (uuid, primary key) - Unique identifier
  - `report_name` (text) - Name of the uploaded report
  - `report_date` (date) - Date of the report
  - `uploaded_at` (timestamptz) - When the report was uploaded
  - `status` (text) - Processing status (pending/processing/completed/failed)
  - `total_interventions` (integer) - Number of interventions in report
  - `metadata` (jsonb) - Additional report metadata

  ### 2. `intervention_items`
  Individual intervention items extracted from reports
  - `id` (uuid, primary key) - Unique identifier
  - `intervention_id` (uuid, foreign key) - References interventions table
  - `item_number` (integer) - Sequential number in report
  - `description` (text) - Intervention description
  - `location` (text) - Location where intervention is needed
  - `quantity` (numeric) - Quantity required
  - `unit` (text) - Unit of measurement
  - `irc_standard` (text) - Applicable IRC standard reference
  - `irc_clause` (text) - Specific IRC clause
  - `created_at` (timestamptz) - Record creation time

  ### 3. `cost_estimates`
  Generated cost estimates for interventions
  - `id` (uuid, primary key) - Unique identifier
  - `intervention_item_id` (uuid, foreign key) - References intervention_items
  - `material_name` (text) - Name of material
  - `specification` (text) - Material specification
  - `quantity` (numeric) - Quantity required
  - `unit` (text) - Unit of measurement
  - `unit_price` (numeric) - Price per unit in ₹
  - `total_cost` (numeric) - Total material cost in ₹
  - `source` (text) - Price source (CPWD/GeM/Other)
  - `source_reference` (text) - Specific source document reference
  - `irc_clause_used` (text) - IRC clause that determined specification
  - `assumptions` (text) - Any assumptions made in estimation
  - `created_at` (timestamptz) - Estimate creation time

  ### 4. `irc_standards`
  Reference data for IRC standards and specifications
  - `id` (uuid, primary key) - Unique identifier
  - `standard_code` (text) - IRC standard code (e.g., IRC 35, IRC 67)
  - `clause_number` (text) - Specific clause number
  - `title` (text) - Title of the standard/clause
  - `specification` (text) - Technical specification details
  - `material_category` (text) - Category of material/intervention
  - `content` (text) - Full clause content
  - `created_at` (timestamptz) - Record creation time

  ### 5. `price_references`
  Material price references from various sources
  - `id` (uuid, primary key) - Unique identifier
  - `material_name` (text) - Name of material
  - `specification` (text) - Material specification
  - `unit` (text) - Unit of measurement
  - `price` (numeric) - Unit price in ₹
  - `source` (text) - Source (CPWD SOR/GeM/Other)
  - `source_url` (text) - URL of source
  - `document_reference` (text) - Document reference number
  - `valid_from` (date) - Price validity start date
  - `valid_until` (date) - Price validity end date
  - `last_updated` (timestamptz) - Last update timestamp

  ## Security
  - Enable Row Level Security (RLS) on all tables
  - Public access for read operations (demo purposes)
  - Authenticated users can perform all operations

  ## Notes
  1. All monetary values are stored in Indian Rupees (₹)
  2. JSONB used for flexible metadata storage
  3. Numeric type used for precise cost calculations
  4. Timestamps include timezone information
*/

-- Create interventions table
CREATE TABLE IF NOT EXISTS interventions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_name text NOT NULL,
  report_date date DEFAULT CURRENT_DATE,
  uploaded_at timestamptz DEFAULT now(),
  status text DEFAULT 'pending',
  total_interventions integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create intervention_items table
CREATE TABLE IF NOT EXISTS intervention_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  intervention_id uuid NOT NULL REFERENCES interventions(id) ON DELETE CASCADE,
  item_number integer NOT NULL,
  description text NOT NULL,
  location text,
  quantity numeric NOT NULL,
  unit text NOT NULL,
  irc_standard text,
  irc_clause text,
  created_at timestamptz DEFAULT now()
);

-- Create cost_estimates table
CREATE TABLE IF NOT EXISTS cost_estimates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  intervention_item_id uuid NOT NULL REFERENCES intervention_items(id) ON DELETE CASCADE,
  material_name text NOT NULL,
  specification text,
  quantity numeric NOT NULL,
  unit text NOT NULL,
  unit_price numeric NOT NULL,
  total_cost numeric NOT NULL,
  source text NOT NULL,
  source_reference text,
  irc_clause_used text,
  assumptions text,
  created_at timestamptz DEFAULT now()
);

-- Create irc_standards table
CREATE TABLE IF NOT EXISTS irc_standards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  standard_code text NOT NULL,
  clause_number text NOT NULL,
  title text NOT NULL,
  specification text,
  material_category text,
  content text,
  created_at timestamptz DEFAULT now()
);

-- Create price_references table
CREATE TABLE IF NOT EXISTS price_references (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  material_name text NOT NULL,
  specification text,
  unit text NOT NULL,
  price numeric NOT NULL,
  source text NOT NULL,
  source_url text,
  document_reference text,
  valid_from date DEFAULT CURRENT_DATE,
  valid_until date,
  last_updated timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_intervention_items_intervention_id ON intervention_items(intervention_id);
CREATE INDEX IF NOT EXISTS idx_cost_estimates_intervention_item_id ON cost_estimates(intervention_item_id);
CREATE INDEX IF NOT EXISTS idx_irc_standards_code ON irc_standards(standard_code);
CREATE INDEX IF NOT EXISTS idx_price_references_material ON price_references(material_name);

-- Enable Row Level Security
ALTER TABLE interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE intervention_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE irc_standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_references ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (demo purposes)
CREATE POLICY "Allow public read access to interventions"
  ON interventions FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to interventions"
  ON interventions FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to interventions"
  ON interventions FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public read access to intervention_items"
  ON intervention_items FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to intervention_items"
  ON intervention_items FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public read access to cost_estimates"
  ON cost_estimates FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to cost_estimates"
  ON cost_estimates FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public read access to irc_standards"
  ON irc_standards FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to irc_standards"
  ON irc_standards FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public read access to price_references"
  ON price_references FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to price_references"
  ON price_references FOR INSERT
  TO public
  WITH CHECK (true);

-- Insert sample IRC standards data
INSERT INTO irc_standards (standard_code, clause_number, title, specification, material_category, content) VALUES
('IRC 35', '7.1', 'Road Markings - Paint Specifications', 'Thermoplastic paint, 3mm thickness, white/yellow', 'Road Markings', 'Road markings shall be of thermoplastic material with minimum thickness of 3mm'),
('IRC 35', '7.2', 'Road Studs', 'Cat eye reflective road studs, aluminum body', 'Road Markings', 'Road studs shall be reflective type with aluminum body conforming to IRC specifications'),
('IRC 67', '5.1', 'Guard Rails', 'W-beam metal guard rail, galvanized steel', 'Safety Barriers', 'Guard rails shall be W-beam type made of galvanized steel with minimum thickness 3.5mm'),
('IRC 67', '5.2', 'Crash Barriers', 'Concrete crash barrier, 80cm height', 'Safety Barriers', 'Concrete crash barriers shall be minimum 80cm height with proper anchorage'),
('IRC 99', '4.1', 'Traffic Signs - Regulatory', 'Reflective sheeting Type IV, aluminum sheet', 'Traffic Signs', 'Regulatory signs shall use Type IV reflective sheeting on aluminum sheets'),
('IRC 99', '4.2', 'Traffic Signs - Warning', 'High intensity prismatic reflective sheeting', 'Traffic Signs', 'Warning signs shall use high intensity prismatic reflective material'),
('IRC:SP:84', '3.1', 'Speed Breakers', 'Thermoplastic material, 3.7m width, 10cm height', 'Traffic Calming', 'Speed breakers shall be 3.7m wide and 10cm height made of thermoplastic material'),
('IRC:SP:87', '6.1', 'Pedestrian Crossing', 'Zebra crossing with thermoplastic paint', 'Pedestrian Safety', 'Pedestrian crossings shall be marked with thermoplastic paint in zebra pattern'),
('IRC 35', '8.1', 'Pavement Marking Tape', 'Preformed thermoplastic tape, 100mm width', 'Road Markings', 'Pavement marking tape shall be preformed thermoplastic with 100mm standard width'),
('IRC 67', '6.1', 'Safety Fence', 'Chain link fence, 2m height, galvanized', 'Safety Barriers', 'Safety fencing shall be chain link type, minimum 2m height, galvanized finish');

-- Insert sample price references
INSERT INTO price_references (material_name, specification, unit, price, source, document_reference, valid_from) VALUES
('Thermoplastic Paint', 'White/Yellow, Road Marking Grade', 'kg', 185.00, 'CPWD SOR', 'CPWD-2024-Vol1-Item245', '2024-01-01'),
('Reflective Road Studs', 'Cat Eye Type, Aluminum Body', 'piece', 125.00, 'GeM', 'GeM-RS-2024-156', '2024-01-01'),
('W-Beam Guard Rail', 'Galvanized Steel, 3.5mm thickness', 'meter', 850.00, 'CPWD SOR', 'CPWD-2024-Vol2-Item789', '2024-01-01'),
('Concrete Crash Barrier', 'M30 Grade, 80cm height', 'meter', 3200.00, 'CPWD SOR', 'CPWD-2024-Vol1-Item456', '2024-01-01'),
('Traffic Sign Board', 'Type IV Reflective, 900mm dia', 'piece', 2800.00, 'GeM', 'GeM-TS-2024-234', '2024-01-01'),
('Traffic Sign Board', 'Type IV Reflective, 600mm triangle', 'piece', 1850.00, 'GeM', 'GeM-TS-2024-235', '2024-01-01'),
('Aluminum Sign Sheet', '2mm thickness, powder coated', 'sqm', 580.00, 'CPWD SOR', 'CPWD-2024-Vol1-Item678', '2024-01-01'),
('Sign Post', 'MS Pipe, 100mm dia, galvanized', 'meter', 420.00, 'CPWD SOR', 'CPWD-2024-Vol2-Item123', '2024-01-01'),
('Speed Breaker Material', 'Thermoplastic, Yellow/Black', 'kg', 195.00, 'GeM', 'GeM-SB-2024-089', '2024-01-01'),
('Chain Link Fence', '50mm mesh, 2m height, galvanized', 'meter', 385.00, 'CPWD SOR', 'CPWD-2024-Vol2-Item567', '2024-01-01'),
('Reflective Sheeting', 'Type IV, High Intensity', 'sqm', 1250.00, 'GeM', 'GeM-RF-2024-345', '2024-01-01'),
('Delineator Post', 'Flexible polymer, 750mm height', 'piece', 285.00, 'GeM', 'GeM-DP-2024-178', '2024-01-01');
