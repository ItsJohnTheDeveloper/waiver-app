'use client';

import React, { useRef, useState } from 'react';
import axios from 'axios';
import { Bold, Text, TextInput, Button, Callout } from '@tremor/react';
import { Controller, useForm } from 'react-hook-form';
import ReactSignatureCanvas from 'react-signature-canvas';
import SignatureCanvas from 'react-signature-canvas';
import { toBlob } from 'html-to-image';

import DatePicker from 'react-date-picker';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

import { termsAndConditionsList } from '../misc/terms-and-conditions';
import { handleUploadWaiverPicture } from '../../helpers/handleUploadFile';

const InputLabel = ({ children }: { children: React.ReactNode }) => (
  <Text className="mt-5 mb-2 text-black">
    <Bold>{children}</Bold>
  </Text>
);
const SuccessToast = ({ show }: { show: boolean }) => {
  if (!show) return null;
  return (
    <div className="z-10 m-auto sticky top-12">
      <Callout
        className="bg-green-50 border-green-500 text-green-700"
        title="Success!"
        icon={CheckCircleIcon}
      >
        Waiver submitted successfully.
      </Callout>
    </div>
  );
};

type FormValues = {
  dateOfAppt: Date | null;
  firstLastName: string;
  dob: Date | null;
  phone: string;
  email: string;
  tattooLocation: string;
  signatureDate: Date | null;
};

export default function WaiverForm() {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    reset
  } = useForm<FormValues>({
    mode: 'all',
    defaultValues: {
      dateOfAppt: new Date(),
      firstLastName: '',
      dob: null,
      phone: '',
      email: '',
      tattooLocation: '',
      signatureDate: new Date()
    }
  });
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const dobRef = useRef(null);
  const waiverRef = useRef(null);

  const [formBeingSubmitted, setFormBeingSubmitted] = useState(false);

  const [initial1SigPad, setInitial1SigPad] = useState<ReactSignatureCanvas>();
  const [initial2SigPad, setInitial2SigPad] = useState<ReactSignatureCanvas>();
  const [primarySignatureSigPad, setPrimarySignatureSigPad] =
    useState<ReactSignatureCanvas>();

  const requiredInputClass = (input: string) =>
    // @ts-expect-error
    getValues(input) === '' || (errors?.[input] as any)
      ? 'border-b-red-500'
      : '';

  const prepareDocumentSave = async () => {
    if (
      initial1SigPad?.isEmpty() ||
      initial2SigPad?.isEmpty() ||
      primarySignatureSigPad?.isEmpty()
    ) {
      alert('Please sign all required fields.');
      return;
    }
    setFormBeingSubmitted(true);

    // prep the forms html for screenshot
    if (waiverRef?.current) {
      toBlob(waiverRef.current).then(function (blob) {
        if (!blob) return;
        handleUploadWaiverImage(blob, getValues());
      });
    }
  };

  const handleUploadWaiverImage = async (blob: Blob, data: FormValues) => {
    const filename = `${data.firstLastName.replaceAll(
      ' ',
      '_'
    )}-waiver-${new Date().toISOString()}.jpg`;

    const file = new File([blob], filename, { type: 'image/jpg' });

    try {
      await handleUploadWaiverPicture(
        file,
        async (waiverImageUrl: string | undefined) => {
          if (!waiverImageUrl) return;
          await handleUploadWaiverDocument(waiverImageUrl, data);
        }
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleUploadWaiverDocument = async (
    downloadUrl: string,
    data: FormValues
  ) => {
    if (!downloadUrl) return;
    try {
      await axios.post('/api/submissions', {
        ...data,
        dateOfAppt: data.dateOfAppt?.toISOString(),
        dob: data.dob?.toISOString(),
        signatureDate: data.signatureDate?.toISOString(),
        waiverDownloadUrl: downloadUrl
      });

      setShowSuccessToast(true);
      reset(); // reset form values and clear signature pads
      initial1SigPad?.clear();
      initial2SigPad?.clear();
      primarySignatureSigPad?.clear();
      window.scroll({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });

      setFormBeingSubmitted(false);
      setTimeout(() => {
        setShowSuccessToast(false);
      }, 5000);
    } catch (e) {
      console.error({ error: e });
    }
  };

  return (
    <>
      <SuccessToast show={showSuccessToast} />
      <form
        onSubmit={handleSubmit(prepareDocumentSave)}
        className="flex flex-col"
      >
        <div
          className="shadow-xl max-w-3xl py-14 px-4 md:px-14 self-center bg-gray-50"
          ref={waiverRef}
        >
          <div className="text-center my-4">
            <p className="text-xl pt-4">@joytattoo.van</p>
            <p className="text-base my-2 text-sm">4688 Kingsway #603.</p>
            <p className="text-base my-2 text-sm">Burnaby, BC</p>
          </div>
          <InputLabel>
            Date of Appointment{' '}
            <Bold className="text-red-500" id="dateOfAppt">
              * {errors?.dateOfAppt && ' Required '}
            </Bold>{' '}
            (MM/DD/YYYY)
          </InputLabel>
          <Controller
            control={control}
            name="dateOfAppt"
            rules={{ required: true }}
            render={({ field: { ...rest } }) => <DatePicker {...rest} />}
          />
          <div className="text-center my-5">
            <p className="text-base my-4 text-sm">
              ​PLEASE CAREFULLY READ AND BE CERTAIN YOU UNDERSTAND THE
              IMPLICATIONS OF SIGNING THIS FORM. YOUR FINAL SIGNATURE AT THE
              BOTTOM OF THIS DOCUMENT INDICATES YOU FULLY UNDERSTAND AND CONSENT
              TO ALL PROVISIONS BELOW.
            </p>
            <p className="text-base my-4 text-sm">
              By signing below I forfeit all right to bring a suit against{' '}
              <Bold>@joytattoo.van</Bold> for any reason. I will also make every
              effort to obey safety precautions as listed in writing and as
              explained to me verbally. I will ask for clarification when
              needed.
            </p>
          </div>
          <div className="mt-16 mb-12">
            <InputLabel>
              First and Last name:{' '}
              <Bold className="text-red-500">
                * {errors?.firstLastName && ' Required '}
              </Bold>{' '}
            </InputLabel>
            <TextInput
              {...register('firstLastName', { required: true })}
              placeholder={'John Doe'}
              className={requiredInputClass('firstLastName')}
            />
            <InputLabel>
              Date of Birth:{' '}
              <Bold className="text-red-500" id="dob" ref={dobRef}>
                * {errors?.dob && ' Required '}
              </Bold>{' '}
              (MM/DD/YYYY)
            </InputLabel>
            <Controller
              control={control}
              name="dob"
              rules={{ required: true }}
              render={({ field, fieldState }) => {
                if (fieldState.invalid) {
                  // @ts-ignore
                  dobRef?.current?.scrollIntoView();
                }
                return <DatePicker {...field} />;
              }}
            />
          </div>
          <InputLabel>
            Phone number:{' '}
            <Bold className="text-red-500">
              * {errors?.phone && ' Required '}
            </Bold>{' '}
          </InputLabel>
          <TextInput
            {...register('phone', { required: true })}
            placeholder={'604-123-4567'}
            className={requiredInputClass('phone')}
          />
          <InputLabel>Email address:</InputLabel>
          <TextInput {...register('email')} placeholder={'joe@gmail.com'} />
          <p className="text-center mt-6  mb-10 text-base my-4 text-sm">
            PLEASE ADD YOUR INITIAL ONCE YOU HAVE COMPLETELY READ AND AGREED:
          </p>
          <ul className="list-disc">
            {termsAndConditionsList.map((item) => {
              const className = `text-base my-4 text-sm decoration-dotted ${
                item?.bold ? 'font-bold' : ''
              }}`;
              return (
                <li key={item.id} className={className}>
                  {item.text}
                </li>
              );
            })}
          </ul>
          <InputLabel>
            I agree ... <Bold className="text-red-500">*</Bold> (Initial){' '}
          </InputLabel>
          <SignatureCanvas
            penColor="black"
            canvasProps={{
              width: 200,
              height: 100,
              className: 'bg-yellow-200	'
            }}
            ref={(ref) => ref && setInitial1SigPad(ref)}
          />
          <Button
            className="mt-1"
            size="xs"
            variant="light"
            onClick={(e) => {
              e.preventDefault();
              initial1SigPad?.clear();
            }}
          >
            Clear
          </Button>
          <InputLabel>
            The area of my body I request the artist to tattoo:{' '}
            <Bold className="text-red-500">
              * {errors?.tattooLocation && ' Required '}
            </Bold>{' '}
          </InputLabel>
          <TextInput
            {...register('tattooLocation', { required: true })}
            placeholder={'Left arm'}
            className={requiredInputClass('tattooLocation')}
          />
          <div className="flex flex-row my-8">
            <div>
              <SignatureCanvas
                penColor="black"
                canvasProps={{
                  width: 200,
                  height: 100,
                  className: 'bg-yellow-200	'
                }}
                ref={(ref) => ref && setInitial2SigPad(ref)}
              />
              <Button
                className="mt-1"
                size="xs"
                variant="light"
                onClick={(e) => {
                  e.preventDefault();
                  initial2SigPad?.clear();
                }}
              >
                Clear
              </Button>
            </div>
            <span className="mr-4" />
            <InputLabel>
              by signing below I, or my legal guardian, agree that I have read
              the tattoo release form provided by @joytattoo.van and completely
              understand and agree to its terms.
              <Bold className="text-red-500">*</Bold>{' '}
            </InputLabel>
          </div>

          <InputLabel>
            Your Signature <Bold className="text-red-500">*</Bold>
          </InputLabel>
          <div className="w-full">
            <SignatureCanvas
              penColor="black"
              canvasProps={{ className: 'bg-neutral-100 w-full' }}
              ref={(ref) => ref && setPrimarySignatureSigPad(ref)}
            />
            <Button
              className="mt-1"
              size="xs"
              variant="light"
              onClick={(e) => {
                e.preventDefault();
                primarySignatureSigPad?.clear();
              }}
            >
              Clear
            </Button>
          </div>
          <InputLabel>
            Signature Date:{' '}
            <Bold className="text-red-500">
              * {errors?.signatureDate && ' Required '}
            </Bold>{' '}
            (MM/DD/YYYY){' '}
          </InputLabel>
          <Controller
            control={control}
            name="signatureDate"
            rules={{ required: true }}
            render={({ field: { ...rest } }) => <DatePicker {...rest} />}
          />
        </div>
        <div className="flex justify-center">
          <Button
            size="xl"
            className="mt-8 "
            style={{ maxWidth: 400, width: '100%', borderRadius: 30 }}
            type="submit"
            loading={formBeingSubmitted}
            disabled={formBeingSubmitted}
          >
            Submit
          </Button>
        </div>
      </form>
    </>
  );
}
