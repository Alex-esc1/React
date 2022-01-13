import React, {useState} from "react";
import {useDispatch} from "react-redux";
import {Form, Formik} from "formik";

export const ModalDostavka = (props) => {
    const [isSuccessSent, setIsSuccessSent] = useState(false)
    const dispatch = useDispatch();
    const {show, setIsShowModal} = props
    return (
        <div className={show ? "modal modal_active" : "modal"}>
            <div className="modal__inner_1">
                <div className="modal-form">
                    <Formik>
                        {(props) => (
                            <Form>
                                {props.errors && props.errors.all &&
                                <div className={"error"}>
                                    {props.errors.all}
                                    <br/> <br/>
                                </div>
                                }
                                {!props.isSubmitting && !isSuccessSent && (
                                    <div>
                                        <div className="modal-form__title">Уважаемые посетители! 
                                        Служба доставки minus50.by по техническим причинам не работает,
                                         просим позвонить продавцу для уточнения
                                         доставки в Ваш населенный пункт</div>
                                    </div>
                                )}
                            </Form>
                        )}
                    </Formik>
                </div>
                <button className="modal__close" onClick={() => {
                    setIsShowModal(false)
                }}/>
            </div>
            {show && (<div onClick={() => {
                setIsShowModal(false)
            }} className="modal__overlay"/>)}
        </div>
    )
}
