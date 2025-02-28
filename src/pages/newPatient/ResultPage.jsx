import { Button, Descriptions, Tag, Spin, message } from 'antd';
import { useEffect, useState, useCallback, useMemo } from 'react';
import pb from '../../lib/pocketbase';
import { useNavigate } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { Helmet } from 'react-helmet';
import { useFloatingPanelState } from '../../stores/userStore';
import { useToAddPatient } from '../../stores/patientStore';
import { motion } from 'framer-motion';

export default function ResultPage({ id }) {
  const navigate = useNavigate();
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const { openFloat } = useFloatingPanelState();
  const { setToAddPatient } = useToAddPatient();

  // Memoized handler for adding patient to queue
  const addToQueueHandler = useCallback(() => {
    if (!data.name) return;

    setToAddPatient([
      {
        label: `${data.name} | ${data.address}`,
        key: id,
        title: undefined,
        value: data.name,
      },
    ]);
    openFloat();
  }, [data, id, setToAddPatient, openFloat]);

  // Memoized navigation handlers
  const goToHome = useCallback(() => {
    navigate({ to: '/' });
  }, [navigate]);

  const goToNewPatient = useCallback(() => {
    navigate({ to: '/newpatient' });
  }, [navigate]);

  // Fetch patient data once on mount
  useEffect(() => {
    async function fetchPatientData() {
      setLoading(true);
      try {
        const record = await pb.collection('patients').getOne(id);
        setData(record);
      } catch (err) {
        console.error('Error fetching patient data:', err);
        message.error('Failed to load patient data');
      } finally {
        setLoading(false);
      }
    }

    fetchPatientData();
  }, [id]);

  // Memoize description items to prevent unnecessary re-renders
  const descriptionItems = useMemo(() => {
    if (!data.name) return [];

    return [
      {
        label: 'Name',
        children: data.name,
        key: 'name',
      },
      {
        label: 'DOB',
        key: 'dob',
        children: data.dob
          ? dayjs(data.dob).format('YYYY-MM-DD')
          : '-',
      },
      {
        label: 'Weight',
        key: 'weight',
        children: data?.weight?.[0]?.weight || '-',
      },
      {
        label: 'Height',
        key: 'height',
        children: data?.height?.[0]?.height || '-',
      },
      {
        label: 'Sex',
        key: 'sex',
        children: data.sex || '-',
      },
      {
        label: 'Address',
        key: 'address',
        children: data.address || '-',
      },
      {
        label: 'National ID NUM',
        key: 'NID',
        children: data.NID || '-',
      },
      {
        label: 'Contact Phone',
        key: 'phone',
        children: data.phone_number || '-',
      },
      {
        label: 'Martial status',
        key: 'martialStatus',
        children: data.martialStatus || '-',
      },
      {
        label: 'Smoker',
        key: 'smoker',
        children: data.smoker ? (
          <Tag color="green">True</Tag>
        ) : (
          <Tag color="blue">False</Tag>
        ),
      },
    ];
  }, [data]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="new-patient-result-wrapeer"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Helmet>
        <title>{data.name || 'Patient Registration'}</title>
      </Helmet>

      <div className="container">
        <motion.h1 style={{ color: 'white' }} variants={itemVariants}>
          تم تسجيل المريض بنجاح
        </motion.h1>

        {loading ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '2rem',
            }}
          >
            <Spin size="large" />
          </div>
        ) : (
          <motion.div variants={itemVariants}>
            <Descriptions
              className="result-descriptions"
              bordered
              labelStyle={{
                width: '10px',
              }}
              column={1}
              contentStyle={{
                textAlign: 'center',
                fontWeight: 'bolder',
              }}
              items={descriptionItems}
            />
          </motion.div>
        )}

        <motion.div
          className="ctas-container"
          variants={itemVariants}
        >
          <div className="first-row">
            <Button onClick={goToHome} type="default" size="large">
              الصفحة الرئيسية
            </Button>

            <Button
              onClick={goToNewPatient}
              type="default"
              size="large"
            >
              اضافة مريض جديد
            </Button>
          </div>
          <Button
            size="large"
            onClick={addToQueueHandler}
            type="primary"
            disabled={loading || !data.name}
          >
            اضافة المريض الى الدور
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
