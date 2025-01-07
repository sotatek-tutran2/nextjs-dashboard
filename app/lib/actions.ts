// By adding the 'user server', you mark all the exported functions within the file as Server Actions
// These server functions can then be imported and used in Client and Server components

'use server';
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

const invoicesPath = '/dashboard/invoices';

export type ActionState = {
  message?: string | null;
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
};

// This may seem confusing initially, but it'll make more sense once you update the server action.
const InvoiceFormSchema = z.object({
  id: z.string(),
  // Zod already throws an error if the customer field is empty as it expects a type string. But let's add a friendly
  // message if user doesn't select a customer
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  // Since you are coercing the amount type from string to number, it'll default to zero if the string is empty. Let's tell Zod we always
  // want the amount greater than 0 with the .gt() function
  amount: z.coerce.number().gt(0, {
    message: 'Please enter an amount greater than $0.',
  }),
  // Zod already throws an error if the status field is empty as it expects "pending" or "paid". Let's also add a friendly
  // message if the user doesn't select a status
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status',
  }),
  date: z.string(),
});

const CreateInvoice = InvoiceFormSchema.omit({ id: true, date: true });

export async function createInvoice(_: ActionState, formData: FormData) {
  // prevState contains the state passed from the useActionState hook. You won't be using it in the action in this example, but it's a required prop
  // safeParse() will return an object containing either success or error field. This will help handle validation more gracefully
  // without having put this logic inside the try/catch block
  const { success, error, data } = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!success) {
    return {
      errors: error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }

  const amountInCents = data.amount * 100;
  const date = new Date().toISOString().split('T')[0];

  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${data.customerId}, ${amountInCents}, ${data.status}, ${date})
    `;
  } catch (error) {
    // First, let's add Javascript's try/catch statements to your Server Actions to allow you to handle errors gracefully
    console.log(error);
    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }

  revalidatePath(invoicesPath);
  // In Server Actions and Route Handlers, redirect should be called after the try/catch block
  redirect(invoicesPath);
}

// Use Zod to update the expected types
const UpdateInvoice = InvoiceFormSchema.omit({ id: true, date: true });

export async function updateInvoice(
  id: string,
  _: ActionState,
  formData: FormData
) {
  // 1. Extracting the data from formData

  // 2. Validating the types with Zod
  const { success, error, data } = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  if (!success) {
    return {
      errors: error.flatten().fieldErrors,
      message: 'Missing fields. Failed to update invoice',
    };
  }

  // 3. Converting the amount to cents
  const amountInCents = Math.round(data.amount * 100);
  try {
    // 4. Passing the variables to your SQL query
    await sql`
    UPDATE invoices
    SET customer_id = ${data.customerId}, amount = ${amountInCents}, status = ${data.status}
    WHERE id = ${id}
  `;
  } catch (error) {
    console.log(error);
    return {
      message: 'Database Error: Failed to Update Invoice.',
    };
  }

  // In Server Actions and Route Handlers, redirect should be called after the try/catch block

  // calling revalidatePath to clear the client cache and make a new server request
  revalidatePath(invoicesPath);

  // calling redirect to redirect user to the invoice's page
  redirect(invoicesPath);
}

// create a new action called deleteInvoice.
export async function deleteInvoice(id: string) {
  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
    return {
      message: 'Deleted Invoice.',
    };
    // Since this action is being called in the /dashboard/invoices path, you don't need to call redirect.
    // Calling revalidatePath will trigger a new server request and re-render the table
  } catch (error) {
    // Seeing these errors are helpful while developing as you can catch any potential problems early.
    // However, you also want to show errors to the user to avoid an abrupt failure and allow your app to continue running
    console.log(error);
    return {
      message: ' Database Error: Failed to Delete Invoice',
    };
  }
}

// In this chapter, you learn how to use Server Actions to mutate data. You also learned how to use
// the validatePath API to revalidate the Next.js cache and redirect to redirect the user to the new page

// In your actions.ts file, create a new action called authenticate.
// This action should import the signIn function from auth.ts
export async function authenticate(_: string | undefined, formData: FormData) {
  try {
    console.log({ formData });
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        // If there's a 'CredentialsSignin' error, you want to show an appropriate error message.
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}
