import { Button, Descriptions, Tag } from 'antd';
import { useEffect, useState } from 'react';
import pb from '../../lib/pocketbase';
import { useNavigate } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { Helmet } from 'react-helmet';
import { useFloatingPanelState } from '../../stores/userStore';
import { useToAddPatient } from '../../stores/patientStore';

export default function ResultPage({ id }) {
  const navigate = useNavigate();

  const [data, setData] = useState({});

  const { openFloat } = useFloatingPanelState();
  const { setToAddPatient } = useToAddPatient();

  const addToQueueHandler = () => {
    // key: '5sxh0leuemvbq74';
    // label: 'محمد نبيل رفاعي احمد | نامول - طوخ - القليوبية';
    // title: undefined;
    // value: 'محمد نبيل رفاعي احمد';

    console.log();

    setToAddPatient([
      {
        label: `${data.name} | ${data.address}`,
        key: id,
        title: undefined,
        value: data.name,
      },
    ]);
    openFloat();
  };

  useEffect(() => {
    async function fetch() {
      try {
        const record = await pb.collection('patients').getOne(id);
        setData(record);
      } catch (err) {}
    }
    fetch();
  }, []);
  return (
    <div className="new-patient-result-wrapeer">
      <Helmet>
        <title>{data.name}</title>
      </Helmet>

      <div className="container">
        <h1 style={{ color: 'white' }}>تم تسجيل المريض بنجاح</h1>
        <Descriptions
          className="result-descriptions"
          bordered
          labelStyle={{
            width: '10px',
          }}
          column={1}
          contentStyle={{ textAlign: 'center', fontWeight: 'bolder' }}
          items={
            data.name && [
              {
                label: 'Name',
                children: data.name,
                key: 'name',
              },
              {
                label: 'DOB',
                key: 'dob',
                children: dayjs(data.dob).format('YYYY-MM-DD'),
              },
              {
                label: 'Weight',
                key: 'weight',
                children: data.weight,
              },
              {
                label: 'Height',
                key: 'height',
                children: data.height,
              },
              { label: 'Sex', key: 'sex', children: data.sex },
              {
                label: 'Address',
                key: 'address',
                children: data.address,
              },
              {
                label: 'National ID NUM',
                key: 'NID',
                children: data.NID,
              },
              {
                label: 'Contact Phone',
                key: 'phone',
                children: data.phone_number,
              },
              {
                label: 'Martial status',
                key: 'martialStatus',
                children: data.martialStatus,
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
            ]
          }
        />
        <div className="ctas-container">
          <div className="first-row">
            <Button
              onClick={() => navigate({ to: '/' })}
              type="default"
              size="large"
            >
              الصفحة الرئيسية
            </Button>

            <Button
              onClick={() => navigate({ to: '/newpatient' })}
              type="default"
              size="large"
            >
              اضافة مريض جديد
            </Button>
          </div>
          <Button
            size="large"
            onClick={() => addToQueueHandler()}
            type="primary"
          >
            اضافة المريض الى الدور
          </Button>
        </div>
      </div>
    </div>
  );
}
