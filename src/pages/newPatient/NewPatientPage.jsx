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
} from 'antd';
import dayjs from 'dayjs';

import { PhoneFilled, UserAddOutlined } from '@ant-design/icons';
import pb from '../../lib/pocketbase';
import { useNavigate } from '@tanstack/react-router';
import { useNewPatientModal } from '../../stores/patientStore';

export default function NewpatientPage({
  isModal = false,
  reservationData = null,
}) {
  const { setIsModalOpen } = useNewPatientModal();

  const [form] = Form.useForm();
  const navigate = useNavigate();

  const formFinishHandler = async (e) => {
    const data = {
      ...e,
      dob: dayjs(e.dob).format('YYYY-MM-DD'),
      allergies: [],
      operations: [],
      created_by_assistant: pb.authStore.model.id,
    };
    const record = await pb.collection('patients').create(data);

    if (record && isModal) {
      try {
        const updatedRecord = await pb
          .collection('queue')
          .update(reservationData.id, {
            name: '',
            patient: record.id,
          });

        if (updatedRecord) {
          setIsModalOpen(false);
          message.success('تم إنشاء المريض الجديد بنجاح');
        }
      } catch (error) {
        message.error('حدث خطأ أثناء إنشاء المريض الجديد');
      }
      return;
    }

    if (record && !isModal) {
      navigate({
        params: { id: record.id },
        to: '/newpatient/result/$id',
      });
    }
  };
  function handleInputFocus(event) {
    // Wait for the keyboard to appear
    setTimeout(() => {
      event.target.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 300);
  }

  return (
    <>
      <div
        className="new-patient-container"
        style={{
          padding: isModal ? null : '1rem',
        }}
      >
        <h1>تسجيل مريض جديد</h1>
        <Divider />
        <Form
          form={form}
          autoComplete="new-state"
          className="form"
          layout="vertical"
          size="large"
          clearOnDestroy
          onFinish={formFinishHandler}
          dir="rtl"
        >
          <Form.Item
            label="الاسم رباعي"
            name="name"
            normalize={(e) =>
              e
                .replace(/\s+/g, ' ')
                .replace(/ى/g, 'ي')
                .replace(/أ|إ/g, 'ا')
                .replace('ة', 'ه')
                .replace('عبد ', 'عبد')
            }
            rules={[
              {
                required: true,
                message: 'يجب ادخال اسم المريض رباعيا',
              },
            ]}
            extra={
              <span style={{ userSelect: 'none' }}>
                الاسم باللغة العربية فقط{' '}
              </span>
            }
          >
            <Input
              onFocus={handleInputFocus}
              placeholder={reservationData?.name}
              autoComplete="new-state"
              lang="ar"
              style={{
                textAlign: 'center',
                fontSize: 22,
                direction: 'rtl',
              }}
            />
          </Form.Item>
          <Form.Item
            label="النوع"
            name="sex"
            required
            rules={[
              { required: true, message: 'Must select patient sex' },
            ]}
          >
            <Radio.Group buttonStyle="solid">
              <Radio.Button value="male">ذكر</Radio.Button>
              <Radio.Button value="female">انثى</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            label="العنوان"
            name="address"
            normalize={(e) => e.replace(/\s+/g, ' ')}
            rules={[{ required: true, message: 'يجب ادخال العنوان' }]}
          >
            <Input
              autoComplete="new-state"
              onFocus={handleInputFocus}
            />
          </Form.Item>
          <Form.Item label="تاريخ الميلاد" name="dob">
            <DatePicker
              onFocus={handleInputFocus}
              format={[
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
              ]}
              maxDate={dayjs()}
              // onChange={(e) =>
              //   setBasicInfo({
              //     ...basicInfo,
              //     dob: e,
              //   })
              // }
              picker="date"
              allowClear={true}
            />
          </Form.Item>

          <Form.Item label="الوزن" name="weight">
            <InputNumber
              onFocus={handleInputFocus}
              controls={false}
              addonAfter="كيلوجرام"
            />
          </Form.Item>
          <Form.Item label="الطول" name="height">
            <InputNumber
              onFocus={handleInputFocus}
              controls={false}
              addonAfter="سنتيميتر"
            />
          </Form.Item>

          <Form.Item
            label="رقم الموبايل"
            name="phone_number"
            rules={[
              { len: 11, message: 'Phone number is 11 number' },
              {
                pattern: /^[0-9]+$/,
                message: "Phone number can't have text",
              },
            ]}
          >
            <Input
              onFocus={handleInputFocus}
              autoComplete="new-state"
              addonAfter={
                <PhoneFilled
                  style={{ fontSize: 22, color: 'green' }}
                />
              }
            />
          </Form.Item>
          <Form.Item
            label="الرقم القومي "
            name="NID"
            rules={[
              { len: 14, message: 'NIN is 14 number' },
              {
                pattern: /^[0-9]+$/,
                message: "National Id Number can't have text",
              },
            ]}
          >
            <Input onFocus={handleInputFocus} />
          </Form.Item>
          <Form.Item
            label="الحالة الاجتماعية"
            name="martialStatus"
            labelCol={4}
          >
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
            <Input.TextArea autoSize onFocus={handleInputFocus} />
          </Form.Item>
          <Form.Item
            noStyle
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
            icon={<UserAddOutlined style={{ fontSize: 25 }} />}
            style={{
              marginTop: 10,
              fontSize: 20,
              width: '100%',
              marginBottom: isModal ? null : '120px',
            }}
          >
            تسجيل مريض جديد
          </Button>
        </Form>
      </div>
    </>
  );
}

function setAppHeight() {
  const doc = document.documentElement;
  doc.style.setProperty('--app-height', `${window.innerHeight}px`);
}

window.addEventListener('resize', setAppHeight);
setAppHeight();
if ('visualViewport' in window) {
  window.visualViewport.addEventListener('resize', setAppHeight);
}
