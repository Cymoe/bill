-- Update all client addresses to real Denver metro area addresses
-- This provides a realistic view for demos where construction companies typically operate locally

-- Create a temporary table with real Denver area addresses
CREATE TEMP TABLE denver_addresses (
  id SERIAL,
  address TEXT
);

-- Insert 100+ real Denver metro area addresses
INSERT INTO denver_addresses (address) VALUES
-- Downtown Denver
('1560 Broadway, Denver, CO 80202'),
('1801 California St, Denver, CO 80202'),
('1999 Broadway, Denver, CO 80202'),
('410 17th St, Denver, CO 80202'),
('1515 Arapahoe St, Denver, CO 80202'),
('1400 16th St, Denver, CO 80202'),
('1660 Lincoln St, Denver, CO 80264'),
('1225 17th St, Denver, CO 80202'),
('950 17th St, Denver, CO 80202'),
('1875 Lawrence St, Denver, CO 80202'),

-- Cherry Creek
('3000 E 1st Ave, Denver, CO 80206'),
('2500 E 1st Ave, Denver, CO 80206'),
('201 University Blvd, Denver, CO 80206'),
('299 Milwaukee St, Denver, CO 80206'),
('100 Fillmore St, Denver, CO 80206'),

-- Capitol Hill
('1250 E Colfax Ave, Denver, CO 80218'),
('1000 E 11th Ave, Denver, CO 80218'),
('1350 Grant St, Denver, CO 80203'),
('1100 Pennsylvania St, Denver, CO 80203'),
('900 Sherman St, Denver, CO 80203'),

-- LoDo (Lower Downtown)
('1515 Wynkoop St, Denver, CO 80202'),
('1624 Market St, Denver, CO 80202'),
('1730 Blake St, Denver, CO 80202'),
('2000 Lawrence St, Denver, CO 80205'),
('1900 Wazee St, Denver, CO 80202'),

-- Highlands
('3500 W 32nd Ave, Denver, CO 80211'),
('2500 W 29th Ave, Denver, CO 80211'),
('3300 Tejon St, Denver, CO 80211'),
('3800 Tennyson St, Denver, CO 80212'),
('4100 Federal Blvd, Denver, CO 80211'),

-- Washington Park
('700 S Franklin St, Denver, CO 80209'),
('850 S Gaylord St, Denver, CO 80209'),
('1000 S Pearl St, Denver, CO 80210'),
('1200 S University Blvd, Denver, CO 80210'),
('600 S Marion Pkwy, Denver, CO 80209'),

-- Aurora
('14200 E Alameda Ave, Aurora, CO 80012'),
('16000 E Centretech Pkwy, Aurora, CO 80011'),
('13500 E Colfax Ave, Aurora, CO 80011'),
('2700 S Havana St, Aurora, CO 80014'),
('3200 S Parker Rd, Aurora, CO 80014'),
('1400 S Abilene St, Aurora, CO 80012'),
('15000 E 6th Ave, Aurora, CO 80011'),
('12100 E Iliff Ave, Aurora, CO 80014'),

-- Littleton
('5901 S Santa Fe Dr, Littleton, CO 80120'),
('7700 W Bowles Ave, Littleton, CO 80123'),
('8501 W Bowles Ave, Littleton, CO 80123'),
('2600 W Belleview Ave, Littleton, CO 80123'),
('5995 S Holly St, Littleton, CO 80121'),
('6900 S Pierce St, Littleton, CO 80128'),
('8000 S Kipling Pkwy, Littleton, CO 80128'),

-- Westminster
('8800 Westminster Blvd, Westminster, CO 80031'),
('9000 W 88th Ave, Westminster, CO 80021'),
('10200 W 120th Ave, Westminster, CO 80234'),
('11000 Westmoor Dr, Westminster, CO 80021'),
('7400 W 92nd Ave, Westminster, CO 80021'),
('8500 W 96th Ave, Westminster, CO 80021'),

-- Lakewood
('1400 S Wadsworth Blvd, Lakewood, CO 80232'),
('7500 W Colfax Ave, Lakewood, CO 80214'),
('8555 W Belleview Ave, Lakewood, CO 80227'),
('3000 S Federal Blvd, Lakewood, CO 80236'),
('11500 W 6th Ave, Lakewood, CO 80215'),
('445 S Allison Pkwy, Lakewood, CO 80226'),

-- Arvada
('5200 Wadsworth Bypass, Arvada, CO 80002'),
('7800 W 58th Ave, Arvada, CO 80002'),
('8500 Ralston Rd, Arvada, CO 80002'),
('6700 W 52nd Ave, Arvada, CO 80002'),
('9200 W 58th Ave, Arvada, CO 80002'),

-- Englewood
('3333 S Bannock St, Englewood, CO 80110'),
('3500 S Broadway, Englewood, CO 80113'),
('4000 S Federal Blvd, Englewood, CO 80110'),
('2800 S University Blvd, Englewood, CO 80113'),
('3400 S Clarkson St, Englewood, CO 80113'),

-- Parker
('18300 E Lincoln Ave, Parker, CO 80134'),
('19500 E Parker Square Dr, Parker, CO 80134'),
('11000 S Parker Rd, Parker, CO 80134'),
('9300 S Parker Rd, Parker, CO 80134'),
('16900 E Main St, Parker, CO 80134'),

-- Greenwood Village
('6200 S Syracuse Way, Greenwood Village, CO 80111'),
('7200 S Alton Way, Greenwood Village, CO 80112'),
('8101 E Belleview Ave, Greenwood Village, CO 80111'),
('5600 Greenwood Plaza Blvd, Greenwood Village, CO 80111'),
('6400 S Fiddlers Green Cir, Greenwood Village, CO 80111'),

-- Centennial
('7500 E Arapahoe Rd, Centennial, CO 80112'),
('8000 E Prentice Ave, Centennial, CO 80111'),
('9800 E Easter Ave, Centennial, CO 80112'),
('6900 S Yosemite St, Centennial, CO 80112'),
('8200 S Quebec St, Centennial, CO 80112');

-- Update existing clients with random Denver addresses
WITH numbered_clients AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM clients
),
address_count AS (
  SELECT COUNT(*) as total FROM denver_addresses
)
UPDATE clients c
SET address = da.address
FROM numbered_clients nc
JOIN denver_addresses da ON da.id = ((nc.rn - 1) % (SELECT total FROM address_count) + 1)
WHERE c.id = nc.id;

-- For any new clients created after this migration, you might want to use a default
-- or require a real address during creation

-- Optional: Add a comment to the clients table
COMMENT ON COLUMN clients.address IS 'Real addresses in Denver metro area for realistic demo data';