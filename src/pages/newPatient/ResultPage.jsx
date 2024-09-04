import { Button, Descriptions, Tag } from 'antd';
import { useEffect, useState } from 'react';
import pb from '../../lib/pocketbase';
import { useNavigate } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { Helmet } from 'react-helmet';
import { CheckCircleFilled } from '@ant-design/icons';

export default function ResultPage({ id }) {
  const navigate = useNavigate();

  const [data, setData] = useState({});

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
        <h1>تم تسجيل المريض بنجاح</h1>
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
            <Button onClick={() => navigate({ to: '/' })} type="link">
              الصفحة الرئيسية
            </Button>

            <Button
              onClick={() => navigate({ to: '/newpatient' })}
              type="dashed"
            >
              اضافة مريض جديد
            </Button>
          </div>
          <Button
            size="large"
            // To be...
            // onClick={() => console.log('add to queue')}
            type="primary"
          >
            اضافة المريض الى الدور
          </Button>
        </div>
      </div>
    </div>
  );
}
