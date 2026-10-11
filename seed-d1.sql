-- seed-d1.sql (dibuat otomatis oleh src/lib/db/export-d1.ts)
-- Sumber: ./data/app.db
-- Dihasilkan: 2026-10-11T05:02:20.684Z

PRAGMA foreign_keys = OFF;
DELETE FROM `leave_requests`;
DELETE FROM `attendance`;
DELETE FROM `parents`;
DELETE FROM `students`;
DELETE FROM `settings`;
DELETE FROM `tenant_users`;
DELETE FROM `classes`;
DELETE FROM `users`;
DELETE FROM `tenants`;

INSERT INTO `tenants` (`id`, `slug`, `name`, `address`, `phone`, `logo_url`, `is_active`, `created_at`, `updated_at`) VALUES (1, 'smp-cendekia', 'SMP Cendekia', 'Jl. Merdeka 1', '08123456789', NULL, 1, 1791339412000, 1791339412000);
INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `role`, `is_active`, `created_at`, `updated_at`) VALUES (1, 'superadmin@presensi.local', 'pbkdf2$100000$f8gttxBGLwoJ8MOBxpl8dA==$PcOA5kdiucSLicCgHpHeJr8xTAZB5HkRTag5PPDDjpE=', 'Super Admin', 'superadmin', 1, 1791339406000, 1791339406000);
INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `role`, `is_active`, `created_at`, `updated_at`) VALUES (2, 'admin@smp.test', 'pbkdf2$100000$yUpmSp7greuurmyKo2VV/Q==$39b8eONSERUTqMyyQblqRriTOYrxU/WO4qRM94VoFx8=', 'Admin SMP', 'admin', 1, 1791339412000, 1791339412000);
INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `role`, `is_active`, `created_at`, `updated_at`) VALUES (3, 'budi@smp.test', 'pbkdf2$100000$PhXeYeD3G+9BeK/FKGGW0w==$B05odg0HbfuRxC8slDoP+3YvdRYLxO59hjl5EWGvZME=', 'Budi Santoso', 'siswa', 1, 1791339412000, 1791339412000);
INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `role`, `is_active`, `created_at`, `updated_at`) VALUES (4, 'rina@smp.test', 'pbkdf2$100000$o8n+bfcJiOs8CS13+yzB4w==$+KrvDVQ5VCjqYa8F0LmMv196ST1LwHLvyCs8isk0drg=', 'Rina Budi', 'wali', 1, 1791339412000, 1791339412000);
INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `role`, `is_active`, `created_at`, `updated_at`) VALUES (5, 'andi@smp.test', 'pbkdf2$100000$QwXRGi3rA69JqTfNsIVGcA==$fv0VJTyxGx+3mZxqUuQf4DkJPncc/EMtOqJZ4Qlg2RE=', 'Andi MIPA', 'siswa', 1, 1791341013000, 1791341013000);
INSERT INTO `classes` (`id`, `tenant_id`, `name`, `grade`, `year`, `wali_kelas_id`) VALUES (1, 1, 'VII A', '7', 2026, NULL);
INSERT INTO `tenant_users` (`id`, `tenant_id`, `user_id`) VALUES (1, 1, 2);
INSERT INTO `tenant_users` (`id`, `tenant_id`, `user_id`) VALUES (2, 1, 3);
INSERT INTO `tenant_users` (`id`, `tenant_id`, `user_id`) VALUES (3, 1, 4);
INSERT INTO `tenant_users` (`id`, `tenant_id`, `user_id`) VALUES (4, 1, 5);
INSERT INTO `settings` (`id`, `tenant_id`, `school_name`, `address`, `phone`, `lat`, `lng`, `radius`, `working_hours_start`, `working_hours_end`) VALUES (1, 1, 'SMP Cendekia', 'Jl. Merdeka 1', NULL, -6.2, 106.816666, 150, '07:00', '15:00');
INSERT INTO `students` (`id`, `tenant_id`, `user_id`, `class_id`, `nis`, `nisn`, `phone`, `address`, `divisi`) VALUES (1, 1, 3, 1, '1001', NULL, NULL, NULL, NULL);
INSERT INTO `students` (`id`, `tenant_id`, `user_id`, `class_id`, `nis`, `nisn`, `phone`, `address`, `divisi`) VALUES (2, 1, 5, NULL, '2001', NULL, NULL, NULL, 'MIPA');
INSERT INTO `parents` (`id`, `tenant_id`, `user_id`, `student_id`, `relationship`) VALUES (1, 1, 4, 1, 'Ibu');
INSERT INTO `attendance` (`id`, `tenant_id`, `student_id`, `date`, `check_in_at`, `check_out_at`, `status`, `lat`, `lng`, `radius_ok`, `notes`) VALUES (1, 1, 1, 1791392400, NULL, NULL, 'izin', NULL, NULL, 1, 'Dari pengajuan izin');
INSERT INTO `attendance` (`id`, `tenant_id`, `student_id`, `date`, `check_in_at`, `check_out_at`, `status`, `lat`, `lng`, `radius_ok`, `notes`) VALUES (2, 1, 1, 1791478800, NULL, NULL, 'izin', NULL, NULL, 1, 'Dari pengajuan izin');
INSERT INTO `attendance` (`id`, `tenant_id`, `student_id`, `date`, `check_in_at`, `check_out_at`, `status`, `lat`, `lng`, `radius_ok`, `notes`) VALUES (3, 1, 1, 1791306000, 1791339447, NULL, 'hadir', -6.2, 106.816666, 1, NULL);
INSERT INTO `leave_requests` (`id`, `tenant_id`, `student_id`, `parent_id`, `leave_type`, `start_date`, `end_date`, `reason`, `status`, `approved_by`, `approved_at`, `notes`, `created_at`) VALUES (1, 1, 1, 1, 'izin', 1791392400, 1791478800, 'Acara keluarga', 'approved', 2, 1791339413, NULL, 1791339413000);
INSERT INTO `leave_requests` (`id`, `tenant_id`, `student_id`, `parent_id`, `leave_type`, `start_date`, `end_date`, `reason`, `status`, `approved_by`, `approved_at`, `notes`, `created_at`) VALUES (2, 1, 1, 1, 'sakit', 1791392400, 1791392400, 'sakit', 'approved', 2, 1791441366, NULL, 1791440986000);

PRAGMA foreign_keys = ON;
