import './settings.scss';
import pb from '../../lib/pocketbase';
import { Button, Avatar, Divider, Tooltip } from 'antd';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from '@tanstack/react-router';
import { useCallback, useState, useMemo } from 'react';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';

export default function SettingsPage() {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Get user data from auth store
  const userData = useMemo(() => {
    return {
      name: pb.authStore.model?.name || 'User',
      avatar: pb.authStore.model?.avatar,
      clinics: pb.authStore.model?.expand?.clinics || [],
      doctors: pb.authStore.model?.expand?.doctors || [],
    };
  }, []);

  // Memoized logout handler to prevent unnecessary re-renders
  const handleLogout = useCallback(() => {
    setLoading(true);

    // Small timeout to show loading state
    setTimeout(() => {
      pb.authStore.clear();
      clearAuth();
      // Navigate to login page instead of reloading
      navigate({ to: '/login' });
    }, 500);
  }, [clearAuth, navigate]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 },
    },
  };

  return (
    <>
      <Helmet>
        <title>Settings | {userData.name}</title>
      </Helmet>

      <motion.div
        className="settings-page-wrapper"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div
          className="user-profile-section"
          variants={itemVariants}
        >
          <Avatar
            size={100}
            src={userData.avatar}
            icon={!userData.avatar && <UserOutlined />}
          />
          <h1>{userData.name}</h1>
        </motion.div>

        {(userData.clinics.length > 0 ||
          userData.doctors.length > 0) && (
          <motion.div
            className="info-cards-container"
            variants={itemVariants}
          >
            {userData.clinics.length > 0 && (
              <div className="custom-card info-card">
                <div className="custom-card-header">
                  <h3>العيادات</h3>
                </div>
                <div className="custom-card-body">
                  {userData.clinics.map((clinic) => (
                    <p key={clinic.id}>{clinic.name}</p>
                  ))}
                </div>
              </div>
            )}

            {/* {userData.doctors.length > 0 && (
              <div className="custom-card info-card">
                <div className="custom-card-header">
                  <h3>الأطباء</h3>
                </div>
                <div className="custom-card-body">
                  {userData.doctors.map((doctor) => (
                    <p key={doctor.id}>{doctor.name}</p>
                  ))}
                </div>
              </div>
            )} */}
          </motion.div>
        )}

        <motion.div variants={itemVariants}>
          <Tooltip title="تسجيل خروج">
            <Button
              size="large"
              type="primary"
              danger
              className="logout-btn"
              onClick={handleLogout}
              loading={loading}
              icon={<LogoutOutlined />}
            >
              تسجيل خروج
            </Button>
          </Tooltip>
        </motion.div>
      </motion.div>
    </>
  );
}
