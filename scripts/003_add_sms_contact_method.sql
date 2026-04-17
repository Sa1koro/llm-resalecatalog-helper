-- Add default SMS contact entry for existing installations
INSERT INTO contact_methods (platform, value, label, enabled, sort_order)
SELECT 'sms', '', '短信', false, 4
WHERE NOT EXISTS (
  SELECT 1 FROM contact_methods WHERE platform = 'sms'
);
