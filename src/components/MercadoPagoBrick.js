import { useEffect } from 'react';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';

export default function MercadoPagoBrick({ preferenceId, amount, onPaymentSuccess, publicKey }) {
    useEffect(() => {
        if (publicKey) {
            initMercadoPago(publicKey, {
                locale: 'es-AR'
            });
        }
    }, [publicKey]);

    const initialization = {
        preferenceId: preferenceId,
        amount: amount,
    };

    const customization = {
        visual: {
            style: {
                theme: "default",
            },
        },
        paymentMethods: {
            creditCard: "all",
            debitCard: "all",
            ticket: "all",
            bankTransfer: "all",
            mercadoPago: "all",
        },
    };

    const onSubmit = async ({ selectedPaymentMethod, formData }) => {
        console.log('Payment submitted:', { selectedPaymentMethod, formData });

        const paymentData = {
            ...formData,
            transaction_amount: amount,
        };

        // Fallback for Wallet payments if payment_method_id is missing
        if (!paymentData.payment_method_id && selectedPaymentMethod === 'wallet_purchase') {
            paymentData.payment_method_id = 'account_money';
        }

        return new Promise((resolve, reject) => {
            fetch("/api/process_payment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(paymentData),
            })
                .then((response) => response.json())
                .then((response) => {
                    // receive payment result
                    if (response.status === 'approved' || response.status === 'in_process' || response.status === 'pending') {
                        onPaymentSuccess(response.id, response.status, response.status_detail);
                        resolve();
                    } else {
                        // Handle other statuses (rejected)
                        console.log('Payment status:', response.status);
                        reject();
                    }
                })
                .catch((error) => {
                    // handle error response when trying to create payment
                    console.error('Error processing payment:', error);
                    reject();
                });
        });
    };

    const onError = async (error) => {
        console.log(error);
    };

    const onReady = async () => {
        // Brick is ready
    };

    return (
        <Payment
            initialization={initialization}
            customization={customization}
            onSubmit={onSubmit}
            onReady={onReady}
            onError={onError}
        />
    );
}
