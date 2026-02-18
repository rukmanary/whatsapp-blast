import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from '@/pages/Home';
import { BlastProvider } from '@/context/BlastContext';

function renderHome() {
  return render(
    <BlastProvider>
      <Home />
    </BlastProvider>
  );
}

describe('Home (generator flow)', () => {
  beforeEach(() => {
    globalThis.localStorage.clear();
  });

  test('generates WhatsApp links from uploaded CSV and template', async () => {
    renderHome();

    const file = new File(['name,phone_code,phone_number\nAisha,+62,08123456789\n'], 'contacts.csv', {
      type: 'text/csv',
    });
    fireEvent.change(screen.getByLabelText('Upload CSV'), { target: { files: [file] } });

    await screen.findByText(/✓ contacts\.csv/i);

    fireEvent.change(
      screen.getByPlaceholderText(/Contoh: Assalamu'alaikum/),
      { target: { value: 'Hello {{name}}' } }
    );

    await userEvent.click(screen.getByRole('button', { name: /Generate Pesan/i }));

    expect(screen.getByText('Hasil Generate')).toBeInTheDocument();
    expect(screen.getByText('1 pesan')).toBeInTheDocument();
    expect(screen.getByText('+628123456789')).toBeInTheDocument();
    const sendLink = screen.getByRole('link', { name: 'Kirim Pesan' });
    expect(sendLink).toHaveAttribute(
      'href',
      'https://wa.me/+628123456789?text=Hello%20Aisha'
    );

    await userEvent.click(sendLink);
    expect(sendLink.closest('.message-item')).toHaveClass('clicked');

    await userEvent.click(screen.getByRole('button', { name: 'Copy Pesan' }));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Hello Aisha');
    expect(screen.getByRole('status')).toHaveTextContent('Pesan berhasil dicopy.');

    await userEvent.click(screen.getByRole('button', { name: 'Copy Link' }));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://wa.me/+628123456789?text=Hello%20Aisha');
    expect(screen.getByRole('status')).toHaveTextContent('Link berhasil dicopy.');
  });

  test('saves template to localStorage and can delete with confirmation modal', async () => {
    const { unmount } = renderHome();

    fireEvent.change(screen.getByPlaceholderText(/Contoh: Assalamu'alaikum/), {
      target: { value: "Assalamu'alaikum {{name}}\nIni pesan panjang untuk tooltip" },
    });

    await userEvent.click(screen.getByRole('button', { name: 'Simpan Template' }));

    expect(screen.getByText('Template tersimpan:')).toBeInTheDocument();

    unmount();

    renderHome();
    expect(screen.getByText('Template tersimpan:')).toBeInTheDocument();

    const deleteBtn = screen.getByRole('button', { name: 'Hapus template' });
    await userEvent.click(deleteBtn);
    expect(screen.getByRole('dialog', { name: 'Hapus template?' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Hapus' }));
    expect(screen.queryByText('Template tersimpan:')).not.toBeInTheDocument();
  });
});
