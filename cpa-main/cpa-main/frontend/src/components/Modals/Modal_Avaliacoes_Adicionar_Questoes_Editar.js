import React, { useState } from 'react';
import ButtonTodos from './Button_Todos';
import ButtonSalvar from './Button_Salvar';
import ButtonApenasNesse from './Button_ApenasNesse';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { Form } from 'react-bootstrap';
import './Modal_Avaliacoes'


function Modal_addQuestoes_editar(props){
    const [inputs, setInputs] = useState(['']);

    return (
        <div
          className="modal show"
          style={{ display: 'block', position: 'initial' }}
        >
          <Modal.Dialog>
            <div className='titulo'> 
              <Modal.Header closeButton={false} onHide={onclose} className='titulo-header'>
                <Modal.Title><h6><strong>!</strong></h6></Modal.Title>
              </Modal.Header>
            </div>

            <Modal.Body>

              <div className='message'>
                <Form.Label>Deseja alterar a questão para esse formulário ou para todos os outros a partir de agora?</Form.Label>
              </div>
            </Modal.Body>

            <Modal.Footer>
              <div>
              <ButtonTodos>Todos</ButtonTodos>
              </div>
              <ButtonApenasNesse>Apenas Nesse</ButtonApenasNesse>
            </Modal.Footer>
          </Modal.Dialog>
        </div>
      );
}

export default Modal_addQuestoes_editar;