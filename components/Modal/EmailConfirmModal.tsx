import { useState } from 'react'
import Modal from './Modal'
import Button from 'components/Button/Button'
import styles from './Modal.module.css'

interface ITransaction {
  isOpen: boolean
  onClose: Function
  onOk: Function
  closeOnEscape?: boolean
}

export default function EmailConfirmModal({
  isOpen,
  onClose,
  onOk,
  closeOnEscape,
}: ITransaction) {
  const[email, setEmail] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    document.forms["mc-embedded-subscribe-form"].submit();
    onOk()
  }

  return (
    <Modal
      show={!!isOpen}
      onRequestClose={onClose}
      closeOnEscape={closeOnEscape}
      loading={isOpen}
      modalClassName={styles.emailModal}
    >
      {isOpen && (
        <div className={styles.emailConfirmWrap}>
          <div id="mc_embed_signup">
            <form
              action="https://nftmorning.us6.list-manage.com/subscribe/post?u=07777f5d502b75b517bdb3886&amp;id=9b976a0713"
              method="post"
              id="mc-embedded-subscribe-form"
              name="mc-embedded-subscribe-form"
              className="validate"
              target="_blank"
              noValidate
            >
              <div id="mc_embed_signup_scroll">
                <div className="mc-field-group">
                  <label htmlFor="mce-EMAIL">EMAIL:</label>
                  <input
                    type="email"
                    value={email}
                    name="EMAIL"
                    className="required email"
                    id="mce-EMAIL"
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
                <div hidden={true}>
                  <input type="hidden" name="tags" value="3198334" />
                </div>
                <div id="mce-responses" className="clear">
                  <div
                    className="response"
                    id="mce-error-response"
                    style={{ display: 'none' }}
                  />
                  <div
                    className="response"
                    id="mce-success-response"
                    style={{ display: 'none' }}
                  />
                </div>
                <div
                  style={{ position: 'absolute', left: -5000 }}
                  aria-hidden="true"
                >
                  <input
                    type="text"
                    name="b_07777f5d502b75b517bdb3886_9b976a0713"
                    tabIndex={-1}
                    value=""
                  />
                </div>
                <div className={styles.confirmBtnWrap}>
                  <input
                    type="submit"
                    value="ENTER"
                    name="subscribe"
                    id="mc-embedded-subscribe"
                    className="button"
                    onClick={handleSubmit}
                  />
                </div>
              </div>
            </form>
          </div>
          {/* <div className={styles.confirmBtnWrap}>
            <Button onClick={onOk}>ENTER</Button>
          </div> */}
        </div>
      )}
    </Modal>
  )
}
