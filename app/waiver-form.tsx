'use client';

import React from 'react';
import { Bold, Text, TextInput, Button } from '@tremor/react';
import SignatureCanvas from 'react-signature-canvas';

import Image from 'next/image';
import { Controller, useForm } from 'react-hook-form';
import { termsAndConditionsList } from './misc/waiver';
import DatePicker from 'react-date-picker';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';

const InputLabel = ({ children }: { children: React.ReactNode }) => (
  <Text className="mt-5 mb-2 text-black">
    <Bold>{children}</Bold>
  </Text>
);

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
    getValues
  } = useForm<FormValues>({
    mode: 'all',
    defaultValues: {
      dateOfAppt: null,
      firstLastName: '',
      dob: null,
      phone: '',
      email: '',
      tattooLocation: '',
      signatureDate: null
    }
  });

  let initial1SigPag = {} as any;
  let initial2SigPag = {} as any;

  const requiredInputClass = (input: string) =>
    // @ts-expect-error
    getValues(input) === '' || (errors?.[input] as any)
      ? 'border-b-red-500'
      : '';

  const onCustomSubmit = async (data: FormValues) => {
    try {
      await axios.post('/api/submissions', {
        ...data,
        dateOfAppt: data.dateOfAppt?.toISOString(),
        dob: data.dob?.toISOString(),
        signatureDate: data.signatureDate?.toISOString()
      });
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <form onSubmit={handleSubmit(onCustomSubmit)}>
      <div className="shadow-xl max-w-3xl m-auto py-14 px-4 md:px-14">
        <div className="flex justify-center">
          <Image
            alt="waiver-logo"
            src={'/waiver-logo.jpg'}
            height={100}
            width={100}
          />
        </div>
        <div className="text-center my-4">
          <p className="text-xl pt-4">@joytattoo.van</p>
          <p className="text-base my-2 text-sm">4688 Kingsway #603.</p>
          <p className="text-base my-2 text-sm">Burnaby, BC</p>
        </div>
        <InputLabel>
          Date of Appointment <Bold className="text-red-500">*</Bold>{' '}
          (MM/DD/YYYY)
        </InputLabel>
        <Controller
          control={control}
          name="dateOfAppt"
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
            <Bold>ROYAL ROSE TATTOO INC.</Bold> for any reason. I will also make
            every effort to obey safety precautions as listed in writing and as
            explained to me verbally. I will ask for clarification when needed.
          </p>
        </div>
        <div className="mt-16 mb-12">
          <InputLabel>
            First and Last name: <Bold className="text-red-500">*</Bold>
          </InputLabel>
          <TextInput
            {...register('firstLastName', { required: true })}
            placeholder={'John Doe'}
            className={requiredInputClass('firstLastName')}
          />
          <InputLabel>
            Date of Birth: <Bold className="text-red-500">*</Bold> (MM/DD/YYYY)
          </InputLabel>
          <Controller
            control={control}
            name="dob"
            render={({ field: { ...rest } }) => <DatePicker {...rest} />}
          />
        </div>
        <InputLabel>
          Phone number: <Bold className="text-red-500">*</Bold>
        </InputLabel>
        <TextInput
          {...register('phone', { required: true })}
          placeholder={'604-123-4567'}
          className={requiredInputClass('phone')}
        />
        <InputLabel>Enter Email to recieve a copy of your waiver:</InputLabel>
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
          I agree ... <Bold className="text-red-500">*</Bold> (Initial)
        </InputLabel>
        <SignatureCanvas
          penColor="black"
          canvasProps={{ width: 200, height: 100, className: 'bg-yellow-200	' }}
          ref={(ref) => (initial1SigPag = ref)}
        />
        <Button
          className="mt-1"
          size="xs"
          variant="light"
          onClick={(e) => {
            e.preventDefault();
            initial1SigPag.clear();
          }}
        >
          Clear
        </Button>
        <InputLabel>
          The area of my body I request the artist to tattoo:{' '}
          <Bold className="text-red-500">*</Bold>
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
              ref={(ref) => (initial2SigPag = ref)}
            />
            <Button
              className="mt-1"
              size="xs"
              variant="light"
              onClick={(e) => {
                e.preventDefault();
                initial2SigPag.clear();
              }}
            >
              Clear
            </Button>
          </div>
          <span className="mr-4" />
          <InputLabel>
            by signing below I, or my legal guardian, agree that I have read the
            tattoo release form provided by Royal Rose Tattoo Inc. and
            completely understand and agree to its terms.{' '}
            <Bold className="text-red-500">*</Bold>
          </InputLabel>
        </div>

        <InputLabel>
          Your Signature <Bold className="text-red-500">*</Bold>
        </InputLabel>
        <div className="w-full">
          <SignatureCanvas
            penColor="black"
            canvasProps={{ className: 'bg-neutral-100 w-full' }}
            ref={(ref) => (initial2SigPag = ref)}
          />
          <Button
            className="mt-1"
            size="xs"
            variant="light"
            onClick={(e) => {
              e.preventDefault();
              initial2SigPag.clear();
            }}
          >
            Clear
          </Button>
        </div>
        <InputLabel>
          Signature Date: <Bold className="text-red-500">*</Bold> (MM/DD/YYYY)
        </InputLabel>
        <Controller
          control={control}
          name="signatureDate"
          render={({ field: { ...rest } }) => <DatePicker {...rest} />}
        />
      </div>
      <div className="flex justify-center">
        <Button
          size="xl"
          className="mt-8 "
          style={{ maxWidth: 400, width: '100%', borderRadius: 30 }}
          type="submit"
        >
          Submit
        </Button>
      </div>
    </form>
  );
}
