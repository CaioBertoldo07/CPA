import React, { useRef } from 'react';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import './Toast1.css';  // Certifique-se de que este arquivo existe e não está sobrescrevendo estilos críticos
import 'primereact/resources/themes/saga-blue/theme.css';  // ou outro tema de sua escolha
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

export default function Toast1() {
    const toast = useRef(null);

    const showSuccess = () => {
        toast.current.show({ severity: 'success', summary: 'Success', detail: 'Message Content', life: 3000 });
    }

    return (
        <div>
            <Toast ref={toast} />
            <div className="flex flex-wrap gap-2">
                {/* <Button label="Success" severity="success" onClick={showSuccess} /> */}
            </div>
        </div>
    );
}
