-- Initial Owner Account
-- Replace password hash before production

insert into users (
  name,
  email,
  password_hash,
  role,
  is_active
)
values (
  'Owner',
  'owner@majamu.local',
  'CHANGE_WITH_BCRYPT_HASH',
  'owner',
  true
);
