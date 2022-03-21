import TxLoader from 'components/TxLoader/TxLoader'
import Modal from './Modal'

interface ITransaction {
  network: number
  pending: boolean
  disabled: string
  onClose: Function
  closeOnEscape?: boolean
}

export default function TxModal({
  network,
  pending,
  disabled,
  onClose,
  closeOnEscape,
}: ITransaction) {
  return (
    <Modal
      show={!!pending}
      onRequestClose={onClose}
      closeOnEscape={closeOnEscape}
      loading={pending}
    >
      {pending && <TxLoader hash={pending ? disabled : ''} network={network} />}
    </Modal>
  )
}
