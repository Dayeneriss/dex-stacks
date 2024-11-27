;; Liquidity Token Contract implementing SIP-010
(impl-trait 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sip-010-trait-ft-standard.sip-010-trait)

;; Constants
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-NOT-TOKEN-OWNER (err u101))
(define-constant ERR-INSUFFICIENT-BALANCE (err u102))
(define-constant ERR-INVALID-AMOUNT (err u103))
(define-constant ERR-TRANSFER-FAILED (err u104))
(define-constant ERR-ALREADY-INITIALIZED (err u105))
(define-constant ERR-APPROVAL-EXPIRED (err u106))
(define-constant ERR-REENTRANCY (err u107))

;; Configuration
(define-constant MAX-APPROVAL-PERIOD u150)  ;; Maximum blocks for approval validity

;; Data vars
(define-data-var token-uri (string-utf8 256) u"")
(define-data-var contract-owner principal tx-sender)
(define-data-var initialized bool false)
(define-data-var contract-locked uint u0)

;; Data maps
(define-map token-balances principal uint)
(define-map token-approvals 
  { owner: principal, spender: principal } 
  { amount: uint, expiry: uint })
(define-data-var total-supply uint u0)

;; Reentrancy guard
(define-private (check-reentrancy)
  (let ((is-locked (var-get contract-locked)))
    (asserts! (is-eq is-locked u0) ERR-REENTRANCY)
    (var-set contract-locked u1)
    (ok true)))

(define-private (release-reentrancy-lock)
  (var-set contract-locked u0)
  (ok true))

;; Validation helpers
(define-private (validate-amount (amount uint))
  (begin
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    (ok true)))

(define-private (check-approval 
    (owner principal) 
    (spender principal) 
    (amount uint))
  (let ((approval (default-to 
                   { amount: u0, expiry: u0 } 
                   (map-get? token-approvals { owner: owner, spender: spender }))))
    (asserts! (>= (get expiry approval) block-height) ERR-APPROVAL-EXPIRED)
    (asserts! (>= (get amount approval) amount) ERR-NOT-AUTHORIZED)
    (ok true)))

;; SIP-010 Functions
(define-public (transfer 
    (amount uint) 
    (sender principal) 
    (recipient principal) 
    (memo (optional (buff 34))))
  (begin
    (try! (check-reentrancy))
    (try! (validate-amount amount))
    (asserts! (is-eq tx-sender sender) ERR-NOT-TOKEN-OWNER)
    (try! (transfer-helper amount sender recipient))
    (match memo to-print (print to-print) 0x)
    (try! (release-reentrancy-lock))
    (ok true)))

(define-public (transfer-from 
    (amount uint) 
    (sender principal) 
    (recipient principal) 
    (memo (optional (buff 34))))
  (begin
    (try! (check-reentrancy))
    (try! (validate-amount amount))
    (try! (check-approval sender tx-sender amount))
    (try! (transfer-helper amount sender recipient))
    ;; Update approval amount
    (let ((approval (unwrap! (map-get? token-approvals { owner: sender, spender: tx-sender }) ERR-NOT-AUTHORIZED)))
      (map-set token-approvals 
        { owner: sender, spender: tx-sender }
        { amount: (- (get amount approval) amount), expiry: (get expiry approval) }))
    (match memo to-print (print to-print) 0x)
    (try! (release-reentrancy-lock))
    (ok true)))

(define-public (approve 
    (spender principal) 
    (amount uint)
    (expiry uint))
  (begin
    (try! (check-reentrancy))
    (try! (validate-amount amount))
    (asserts! (<= expiry (+ block-height MAX-APPROVAL-PERIOD)) ERR-APPROVAL-EXPIRED)
    (map-set token-approvals 
      { owner: tx-sender, spender: spender }
      { amount: amount, expiry: expiry })
    (try! (release-reentrancy-lock))
    (ok true)))

(define-read-only (get-name)
  (ok "Liquidity Provider Token"))

(define-read-only (get-symbol)
  (ok "LP"))

(define-read-only (get-decimals)
  (ok u6))

(define-read-only (get-balance (who principal))
  (ok (default-to u0 (map-get? token-balances who))))

(define-read-only (get-total-supply)
  (ok (var-get total-supply)))

(define-read-only (get-token-uri)
  (ok (some (var-get token-uri))))

(define-read-only (get-allowance (owner principal) (spender principal))
  (let ((approval (default-to 
                   { amount: u0, expiry: u0 } 
                   (map-get? token-approvals { owner: owner, spender: spender }))))
    (ok (if (>= (get expiry approval) block-height)
            (get amount approval)
            u0))))

;; Internal Functions
(define-private (transfer-helper (amount uint) (sender principal) (recipient principal))
  (let
    ((sender-balance (default-to u0 (map-get? token-balances sender)))
     (recipient-balance (default-to u0 (map-get? token-balances recipient))))
    
    ;; Check if sender has enough balance
    (asserts! (>= sender-balance amount) ERR-INSUFFICIENT-BALANCE)
    
    ;; Update balances
    (map-set token-balances sender (- sender-balance amount))
    (map-set token-balances recipient (+ recipient-balance amount))
    (ok true)))

;; DEX-specific Functions
(define-public (mint (amount uint) (recipient principal))
  (begin
    (try! (check-reentrancy))
    (try! (validate-amount amount))
    (asserts! (is-eq contract-caller .dex) ERR-NOT-AUTHORIZED)
    (let
      ((recipient-balance (default-to u0 (map-get? token-balances recipient))))
      (map-set token-balances recipient (+ recipient-balance amount))
      (var-set total-supply (+ (var-get total-supply) amount))
      (try! (release-reentrancy-lock))
      (ok true))))

(define-public (burn (amount uint) (owner principal))
  (begin
    (try! (check-reentrancy))
    (try! (validate-amount amount))
    (asserts! (is-eq contract-caller .dex) ERR-NOT-AUTHORIZED)
    (let
      ((owner-balance (default-to u0 (map-get? token-balances owner))))
      (asserts! (>= owner-balance amount) ERR-INSUFFICIENT-BALANCE)
      (map-set token-balances owner (- owner-balance amount))
      (var-set total-supply (- (var-get total-supply) amount))
      (try! (release-reentrancy-lock))
      (ok true))))

;; Initialize new token pair
(define-public (create-token (token-a principal) (token-b principal))
  (begin
    (try! (check-reentrancy))
    (asserts! (is-eq contract-caller .dex) ERR-NOT-AUTHORIZED)
    (asserts! (not (var-get initialized)) ERR-ALREADY-INITIALIZED)
    (var-set token-uri (concat (concat (unwrap-panic (contract-call? token-a get-symbol))
                                     "-")
                              (unwrap-panic (contract-call? token-b get-symbol))))
    (var-set initialized true)
    (try! (release-reentrancy-lock))
    (ok true)))