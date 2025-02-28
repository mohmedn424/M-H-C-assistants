import './newpatient.scss';
import {
  Button,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  Radio,
  Switch,
  message,
} from 'antd';
import dayjs from 'dayjs';
import { PhoneFilled, UserAddOutlined } from '@ant-design/icons';
import pb from '../../lib/pocketbase';
import { useNavigate } from '@tanstack/react-router';
import { useNewPatientModal } from '../../stores/patientStore';
import { useCallback, useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';

// Constants for Arabic text normalization
const ARABIC_REPLACEMENTS = {
  SPACES: /\s+/g,
  YA: /ى/g,
  ALEF: /أ|إ/g,
  TA_MARBUTA: 'ة',
  ABD_SPACE: 'عبد ',
};

// Date format options for the date picker
const DATE_FORMATS = [
  'DD-MM-YYYY',
  'D-M-YYYY',
  'D-MM-YYYY',
  'DD-M-YYYY',
  'DD/MM/YYYY',
  'D/M/YYYY',
  'D/MM/YYYY',
  'DD/M/YYYY',
  'DD\\MM\\YYYY',
  'D\\M\\YYYY',
  'D\\MM\\YYYY',
  'DD\\M\\YYYY',
];

/**
 * New Patient Registration Component
 */
export default function NewpatientPage({
  isModal = false,
  reservationData = null,
}) {
  const [loading, setLoading] = useState(false);
  const { setIsModalOpen } = useNewPatientModal();
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // Normalize Arabic text input
  const normalizeArabicText = useCallback((text) => {
    if (!text) return '';
    return text
      .replace(ARABIC_REPLACEMENTS.SPACES, ' ')
      .replace(ARABIC_REPLACEMENTS.YA, 'ي')
      .replace(ARABIC_REPLACEMENTS.ALEF, 'ا')
      .replace(ARABIC_REPLACEMENTS.TA_MARBUTA, 'ه')
      .replace(ARABIC_REPLACEMENTS.ABD_SPACE, 'عبد');
  }, []);

  // Handle form submission
  const formFinishHandler = useCallback(
    async (values) => {
      if (loading) return; // Prevent multiple submissions

      setLoading(true);

      try {
        const data = {
          ...values,
          dob: values.dob && dayjs(values.dob).format('YYYY-MM-DD'),
          allergies: [],
          operations: [],
          created_by_assistant: pb.authStore.model.id,
          weight: values.weight
            ? [
                {
                  weight: values.weight,
                  date: dayjs().format('YYYY-MM-DD'),
                },
              ]
            : [],
          height: values.height
            ? [
                {
                  height: values.height,
                  date: dayjs().format('YYYY-MM-DD'),
                },
              ]
            : [],
        };

        const record = await pb.collection('patients').create(data, {
          fields:
            'id,name,dob,sex,phone_number,address,weight,height,NID,martialStatus,smoker',
        });

        if (record) {
          message.success('تم تسجيل المريض بنجاح');
          navigate({
            params: { id: record.id },
            to: '/newpatient/result/$id',
            state: { patientData: record },
          });
        }
      } catch (error) {
        console.error('Error creating patient:', error);
        message.error('فشل تسجيل المريض، يرجى المحاولة مرة أخرى');
      } finally {
        setLoading(false);
      }
    },
    [navigate, loading]
  );

  // Scroll input into view when focused
  const handleInputFocus = useCallback((event) => {
    // Wait for the keyboard to appear
    setTimeout(() => {
      event?.target?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 300);
  }, []);
  // Memoize form rules for better performance
  const formRules = useMemo(
    () => ({
      name: [
        {
          required: true,
          message: 'يجب ادخال اسم المريض رباعيا',
        },
        {
          pattern: /^[\u0600-\u06FF\s]+$/,
          message: 'يرجى إدخال الاسم باللغة العربية فقط',
        },
      ],
      sex: [{ required: true, message: 'يجب اختيار النوع' }],
      address: [
        { required: true, message: 'يجب ادخال العنوان' },
        {
          pattern: /^[\u0600-\u06FF\s0-9]+$/,
          message: 'يرجى إدخال العنوان باللغة العربية فقط',
        },
      ],
      dob: [
        {
          required: true,
          message: 'يجب اختيار تاريخ الميلاد',
        },
      ],
      phone: [
        { len: 11, message: 'رقم الهاتف يجب أن يكون 11 رقم' },
        {
          pattern: /^[0-9]+$/,
          message: 'رقم الهاتف يجب أن يحتوي على أرقام فقط',
        },
      ],
      nid: [
        { len: 14, message: 'الرقم القومي يجب أن يكون 14 رقم' },
        {
          pattern: /^[0-9]+$/,
          message: 'الرقم القومي يجب أن يحتوي على أرقام فقط',
        },
      ],
    }),
    []
  );

  // Set app height on mount and cleanup on unmount
  useEffect(() => {
    setAppHeight();
    window.addEventListener('resize', setAppHeight);

    if ('visualViewport' in window) {
      window.visualViewport.addEventListener('resize', setAppHeight);
    }

    return () => {
      window.removeEventListener('resize', setAppHeight);
      if ('visualViewport' in window) {
        window.visualViewport.removeEventListener(
          'resize',
          setAppHeight
        );
      }
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>تسجيل مريض جديد</title>
      </Helmet>

      <div
        className="new-patient-container"
        style={{
          padding: isModal ? undefined : '1rem',
        }}
      >
        <h1>تسجيل مريض جديد</h1>
        <Divider />
        <Form
          form={form}
          autoComplete="off"
          className="form"
          layout="vertical"
          size="large"
          onFinish={formFinishHandler}
          dir="rtl"
          validateTrigger={['onChange', 'onSubmit']}
        >
          <Form.Item
            label="الاسم رباعي"
            name="name"
            normalize={normalizeArabicText}
            rules={formRules.name}
            validateTrigger={['onChange', 'onBlur']}
            extra={
              <span style={{ userSelect: 'none' }}>
                الاسم باللغة العربية فقط
              </span>
            }
          >
            <Input
              onFocus={handleInputFocus}
              placeholder={reservationData?.name}
              autoComplete="off"
              lang="ar"
              style={{
                textAlign: 'center',
                fontSize: 22,
                direction: 'rtl',
              }}
            />
          </Form.Item>

          <Form.Item label="النوع" name="sex" rules={formRules.sex}>
            <Radio.Group buttonStyle="solid">
              <Radio.Button value="male">ذكر</Radio.Button>
              <Radio.Button value="female">انثى</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            label="العنوان"
            name="address"
            normalize={(e) => e?.replace(/\s+/g, ' ')}
            rules={formRules.address}
            validateTrigger={['onChange', 'onBlur']}
          >
            <Input autoComplete="off" onFocus={handleInputFocus} />
          </Form.Item>

          <Form.Item
            label="تاريخ الميلاد"
            name="dob"
            rules={formRules.dob}
          >
            <DatePicker
              onFocus={handleInputFocus}
              format={DATE_FORMATS}
              maxDate={dayjs()}
              picker="date"
              allowClear={true}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item label="الوزن" name="weight">
            <InputNumber
              onFocus={handleInputFocus}
              controls={false}
              addonAfter="كيلوجرام"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item label="الطول" name="height">
            <InputNumber
              onFocus={handleInputFocus}
              controls={false}
              addonAfter="سنتيميتر"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            label="رقم الموبايل"
            name="phone_number"
            rules={formRules.phone}
          >
            <Input
              onFocus={handleInputFocus}
              autoComplete="off"
              addonAfter={
                <PhoneFilled
                  style={{ fontSize: 22, color: 'green' }}
                />
              }
            />
          </Form.Item>

          <Form.Item
            label="الرقم القومي"
            name="NID"
            rules={formRules.nid}
          >
            <Input onFocus={handleInputFocus} />
          </Form.Item>

          <Form.Item label="الحالة الاجتماعية" name="martialStatus">
            <Radio.Group
              buttonStyle="solid"
              onFocus={handleInputFocus}
            >
              <Radio.Button value="Single">اعزب</Radio.Button>
              <Radio.Button value="Married">متزوج</Radio.Button>
              <Radio.Button value="Divorced">مطلق</Radio.Button>
              <Radio.Button value="Widowed">ارمل</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item label="ملاحظات" name="notes">
            <Input.TextArea
              autoSize={{ minRows: 2, maxRows: 6 }}
              onFocus={handleInputFocus}
            />
          </Form.Item>

          <Form.Item
            name="smoker"
            valuePropName="checked"
            initialValue={false}
            className="check-item"
          >
            <div className="smoker-container">
              <h2>مدخن</h2>
              <Switch id="smoker" onFocus={handleInputFocus} />
            </div>
          </Form.Item>

          <Button
            onClick={() => form.submit()}
            type="primary"
            loading={loading}
            icon={<UserAddOutlined style={{ fontSize: 25 }} />}
            style={{
              marginTop: 10,
              fontSize: 20,
              width: '100%',
              marginBottom: isModal ? undefined : '120px',
            }}
          >
            تسجيل مريض جديد
          </Button>
        </Form>
      </div>
    </>
  );
}

// Helper function to set app height for mobile viewport
function setAppHeight() {
  const doc = document.documentElement;
  doc.style.setProperty('--app-height', `${window.innerHeight}px`);
}
