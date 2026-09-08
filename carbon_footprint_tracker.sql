create database carbon_footprint_tracker;
use carbon_footprint_tracker;


CREATE TABLE users ( uid INT AUTO_INCREMENT PRIMARY KEY, uname VARCHAR(100) NOT NULL, email VARCHAR(150) UNIQUE NOT NULL, password_hash TEXT NOT NULL, role ENUM('individual', 'organization'), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP );
CREATE TABLE organization_details ( org_id INT AUTO_INCREMENT PRIMARY KEY, uid INT UNIQUE, org_name VARCHAR(150), industry_type VARCHAR(100), address TEXT, contact_number VARCHAR(15), registration_number VARCHAR(100), num_of_employees INT, energy_sources JSON, waste_disposal_methods TEXT, transportation_type TEXT, gst_number VARCHAR(50), environmental_certifications TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (uid) REFERENCES users(uid) ON DELETE CASCADE );

CREATE TABLE user_profile ( profile_id INT AUTO_INCREMENT PRIMARY KEY, uid INT UNIQUE, vehicle_type VARCHAR(50), fuel_type VARCHAR(50), average_mileage FLOAT, diet_type ENUM('vegan', 'vegetarian', 'non-vegetarian', 'mixed'), household_type VARCHAR(50), household_members INT, house_energy_source VARCHAR(50), appliances_owned TEXT, shopping_preferences ENUM('rarely', 'average', 'regular'), water_usage FLOAT, waste_generated FLOAT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (uid) REFERENCES users(uid) ON DELETE CASCADE );

CREATE TABLE devices ( device_id INT AUTO_INCREMENT PRIMARY KEY, uid INT, device_name VARCHAR(100), device_type VARCHAR(50), location VARCHAR(100), energy_rating VARCHAR(10), power_consumption FLOAT, emissions_emitted FLOAT, last_active TIMESTAMP, FOREIGN KEY (uid) REFERENCES users(uid) ON DELETE CASCADE );

CREATE TABLE emission_reports ( report_id INT AUTO_INCREMENT PRIMARY KEY, uid INT, report_period ENUM('daily', 'weekly', 'monthly'), total_emissions FLOAT, emissions_by_category JSON, generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (uid) REFERENCES users(uid) ON DELETE CASCADE );

CREATE TABLE sustainability_goals ( goal_id INT AUTO_INCREMENT PRIMARY KEY, uid INT, goal_type VARCHAR(50), target_value FLOAT, target_date DATE, progress_percent FLOAT, FOREIGN KEY (uid) REFERENCES users(uid) ON DELETE CASCADE );

CREATE TABLE recommendations ( recommendation_id INT AUTO_INCREMENT PRIMARY KEY, uid INT, recommendation_text TEXT, category VARCHAR(50), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, action_status ENUM('pending', 'in_progress', 'completed'), FOREIGN KEY (uid) REFERENCES users(uid) ON DELETE CASCADE );

CREATE TABLE gamification_rewards ( reward_id INT AUTO_INCREMENT PRIMARY KEY, uid INT, reward_points INT DEFAULT 0, level VARCHAR(50), challenges_completed JSON, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (uid) REFERENCES users(uid) ON DELETE CASCADE );

CREATE TABLE badges ( badge_id VARCHAR(50) PRIMARY KEY, name VARCHAR(100), description TEXT, icon_url TEXT );

CREATE TABLE community_feed ( post_id INT AUTO_INCREMENT PRIMARY KEY, uid INT, content TEXT, timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP, likes INT DEFAULT 0, FOREIGN KEY (uid) REFERENCES users(uid) ON DELETE CASCADE );

CREATE TABLE comments ( comment_id INT AUTO_INCREMENT PRIMARY KEY, post_id INT, uid INT, comment_text TEXT, comment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (post_id) REFERENCES community_feed(post_id) ON DELETE CASCADE, FOREIGN KEY (uid) REFERENCES users(uid) ON DELETE CASCADE );

CREATE TABLE carbon_emissions ( emission_id INT AUTO_INCREMENT PRIMARY KEY, device_id INT, uid INT, timestamp DATETIME NOT NULL, emission_value FLOAT, emission_unit VARCHAR(20), source_type VARCHAR(50), FOREIGN KEY (device_id) REFERENCES devices(device_id) ON DELETE CASCADE, FOREIGN KEY (uid) REFERENCES users(uid) ON DELETE CASCADE );


INSERT INTO users (uname, email, password_hash, role) VALUES
('John Doe', 'john.doe@example.com', 'hashedpassword1', 'individual'),
('Jane Smith', 'jane.smith@example.com', 'hashedpassword2', 'organization'),
('Michael Brown', 'michael.b@example.com', 'hashedpassword3', 'individual'),
('Emily Davis', 'emily.d@example.com', 'hashedpassword4', 'organization'),
('David Johnson', 'david.j@example.com', 'hashedpassword5', 'individual'),
('Emma Wilson', 'emma.w@example.com', 'hashedpassword6', 'organization'),
('Oliver Taylor', 'oliver.t@example.com', 'hashedpassword7', 'individual'),
('Sophia Martinez', 'sophia.m@example.com', 'hashedpassword8', 'organization'),
('Liam Anderson', 'liam.a@example.com', 'hashedpassword9', 'individual'),
('Ava Thomas', 'ava.t@example.com', 'hashedpassword10', 'organization');


INSERT INTO organization_details (uid, org_name, industry_type, address, contact_number, registration_number, num_of_employees, energy_sources, waste_disposal_methods, transportation_type, gst_number, environmental_certifications)
VALUES
(2, 'EcoTech Ltd', 'Technology', '123 Green St, City A', '9876543210', 'REG123456', 100, '{"solar": 50, "wind": 30}', 'Recycling, Composting', 'Electric Vehicles', 'GST12345', 'ISO 14001'),
(4, 'Green Solutions Inc', 'Consulting', '456 Greenway, City B', '8765432109', 'REG654321', 200, '{"coal": 70, "natural_gas": 30}', 'Minimal Waste Disposal', 'Hybrid Cars', 'GST65432', 'LEED Certified'),
(6, 'Clean Future', 'Energy', '789 Eco Park, City C', '7654321098', 'REG789123', 300, '{"solar": 80, "wind": 20}', 'Waste Sorting, Biofuels', 'Public Transport', 'GST78912', 'Carbon Neutral Certified'),
(8, 'Nature Co.', 'Retail', '101 Eco Mall, City D', '6543210987', 'REG567890', 150, '{"renewable": 100}', 'Zero Waste Initiative', 'Electric Buses', 'GST56789', 'Green Business Certified'),
(10, 'Eco Builders', 'Construction', '202 Sustainable Ave, City E', '5432109876', 'REG345678', 250, '{"coal": 60, "natural_gas": 40}', 'Recyclable Materials', 'Carpooling', 'GST34567', 'BREEAM Certified');


INSERT INTO user_profile (uid, vehicle_type, fuel_type, average_mileage, diet_type, household_type, household_members, house_energy_source, appliances_owned, shopping_preferences, water_usage, waste_generated)
VALUES
(1, 'Car', 'Petrol', 15, 'vegetarian', 'Apartment', 3, 'solar', 'TV, Fridge, Washing Machine', 'average', 150, 30),
(3, 'Bike', 'Electric', 50, 'vegan', 'House', 4, 'wind', 'AC, Heater', 'regular', 200, 25),
(5, 'Car', 'Diesel', 12, 'non-vegetarian', 'Apartment', 2, 'coal', 'TV, Microwave', 'rarely', 100, 20),
(7, 'Public Transport', 'N/A', 0, 'mixed', 'Bungalow', 5, 'natural_gas', 'TV, Fridge', 'average', 180, 35),
(9, 'Car', 'Hybrid', 20, 'vegan', 'Apartment', 3, 'solar', 'TV, Washing Machine', 'regular', 170, 28);

INSERT INTO devices (uid, device_name, device_type, location, energy_rating, power_consumption, emissions_emitted)
VALUES
(1, 'Air Conditioner', 'Appliance', 'Living Room', 'A++', 1500, 120),
(3, 'Refrigerator', 'Appliance', 'Kitchen', 'A+', 500, 40),
(5, 'LED TV', 'Appliance', 'Bedroom', 'A+', 100, 8),
(7, 'Microwave', 'Appliance', 'Kitchen', 'B', 1200, 90),
(9, 'Heater', 'Appliance', 'Living Room', 'C', 2000, 150);

INSERT INTO carbon_emissions (device_id, uid, timestamp, emission_value, emission_unit, source_type)
VALUES
(1, 1, NOW(), 120, 'kg CO2', 'Electricity'),
(2, 3, NOW(), 40, 'kg CO2', 'Electricity'),
(3, 5, NOW(), 8, 'kg CO2', 'Electricity'),
(4, 7, NOW(), 90, 'kg CO2', 'Electricity'),
(5, 9, NOW(), 150, 'kg CO2', 'Electricity');

INSERT INTO community_feed (uid, content)
VALUES
(1, 'Started using solar panels, reduced my carbon footprint!'),
(3, 'Switched to an electric vehicle.'),
(5, 'Recycling and composting are game changers!'),
(7, 'Looking for ideas on reducing energy consumption? Let’s discuss.'),
(9, 'Best eco-friendly home appliances? Any recommendations?');

INSERT INTO comments (post_id, uid, comment_text)
VALUES
(1, 3, 'That’s great! How much savings have you noticed?'),
(2, 5, 'Electric vehicles are the future!'),
(3, 7, 'Yes! Recycling has made a huge impact in my home.'),
(4, 9, 'Try using smart meters to track energy usage.'),
(5, 1, 'I use energy-efficient washing machines.');

INSERT INTO badges (badge_id, name, description, icon_url)
VALUES
('eco_champion', 'Eco Champion', 'Awarded for reducing emissions by 50%', 'eco_champion.png'),
('solar_warrior', 'Solar Warrior', 'Using 100% solar energy', 'solar_warrior.png'),
('zero_waste', 'Zero Waste', 'Practicing zero waste living', 'zero_waste.png'),
('green_commuter', 'Green Commuter', 'Using eco-friendly transportation', 'green_commuter.png'),
('eco_saver', 'Eco Saver', 'Saving 500 kg CO2 emissions', 'eco_saver.png');

