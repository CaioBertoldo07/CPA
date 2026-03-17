import React, { useState } from 'react';
import ButtonCancelar from './Button_Cancelar';
import ButtonSalvar from './Button_Salvar';
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
                <Modal.Title><h6><strong>Editar questão</strong></h6></Modal.Title>
              </Modal.Header>
            </div>

            <Modal.Body>
              <input type='text' className='descricao' placeholder='Descrição'></input>
              <p></p> 
              <div className='group'>
                <Form.Label>Padrão de resposta:</Form.Label>
                <div className='seletor'>
                  <Form.Control as="select">
                      <option>Sim</option>
                      <option>Não</option>
                      <option>Não sei responder</option>
                  </Form.Control>
                </div>
              </div>
            </Modal.Body>


            <Modal.Footer>
              <ButtonCancelar>Cancelar</ButtonCancelar>
              <ButtonSalvar>  Salvar  </ButtonSalvar>
            </Modal.Footer>
          </Modal.Dialog>
        </div>
      );
}

export default Modal_addQuestoes_editar;