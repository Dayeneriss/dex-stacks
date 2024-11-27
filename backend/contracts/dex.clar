clarity
;; DEX Contract
(define-data-var contract-owner principal tx-sender)

<<<<<<< HEAD
;; Constants
(define-constant ERR-UNAUTHORIZED (err u100))
(define-constant ERR-INVALID-PAIR (err u101))
(define-constant ERR-POOL-EXISTS (err u102))
(define-constant ERR-POOL-NOT-FOUND (err u103))
(define-constant ERR-INSUFFICIENT-LIQUIDITY (err u104))
(define-constant ERR-SLIPPAGE-TOO-HIGH (err u105))
(define-constant ERR-FLASH-LOAN-FAILED (err u106))
(define-constant ERR-INSUFFICIENT-AMOUNT (err u107))
(define-constant ERR-SAME-TOKEN (err u108))
(define-constant ERR-ZERO-AMOUNT (err u109))
(define-constant ERR-EXPIRED (err u110))
(define-constant ERR-REENTRANCY (err u111))
(define-constant ERR-MAX-IN-RATIO (err u112))
(define-constant ERR-MIN-LIQUIDITY (err u113))

;; Configuration
(define-constant MAX-IN-RATIO u3)  ;; Maximum 33.33% of pool in single trade
(define-constant MIN-LIQUIDITY u1000)  ;; Minimum liquidity to prevent precision loss
(define-constant LOCK-PERIOD u10)  ;; Blocks to wait before allowing pool operations
(define-constant MAX_DEADLINE_EXTENSION u150)  ;; Maximum blocks for deadline

;; Reentrancy protection
(define-data-var contract-locked uint u0)
(define-map operation-locks { tx-sender: principal, operation: (string-ascii 32) } uint)

=======
>>>>>>> origin/main
;; Pool structure
(define-map pools 
  { token-a: principal, token-b: principal }
  { liquidity-token: principal, 
    reserve-a: uint,
<<<<<<< HEAD
    reserve-b: uint,
    total-liquidity: uint,
    last-block-height: uint,
    cumulative-price-a: uint,  ;; For TWAP oracle
    cumulative-price-b: uint,
    last-price-timestamp: uint }
)

;; Reentrancy guard
(define-private (check-reentrancy)
  (let ((is-locked (var-get contract-locked)))
    (asserts! (is-eq is-locked u0) ERR-REENTRANCY)
    (var-set contract-locked u1)
    (ok true)))

(define-private (release-reentrancy-lock)
  (var-set contract-locked u0)
  (ok true))

;; Operation lock helper
(define-private (check-operation-lock (operation (string-ascii 32)))
  (let ((last-operation (default-to u0 
          (map-get? operation-locks { tx-sender: tx-sender, operation: operation }))))
    (asserts! (>= block-height (+ last-operation LOCK_PERIOD)) ERR-REENTRANCY)
    (map-set operation-locks { tx-sender: tx-sender, operation: operation } block-height)
    (ok true)))

;; Validation helpers
(define-private (validate-amounts (amount-a uint) (amount-b uint))
  (begin
    (asserts! (> amount-a u0) ERR-ZERO-AMOUNT)
    (asserts! (> amount-b u0) ERR-ZERO-AMOUNT)
    (ok true)))

(define-private (validate-pool-tokens (token-a principal) (token-b principal))
  (begin
    (asserts! (not (is-eq token-a token-b)) ERR-SAME-TOKEN)
    (ok true)))

(define-private (validate-deadline (deadline uint))
  (begin
    (asserts! (>= deadline block-height) ERR-EXPIRED)
    (asserts! (<= deadline (+ block-height MAX_DEADLINE_EXTENSION)) ERR-EXPIRED)
    (ok true)))

(define-private (validate-max-in-ratio (amount-in uint) (reserve-in uint))
  (begin
    (asserts! (<= (* amount-in MAX-IN-RATIO) reserve-in) ERR-MAX-IN-RATIO)
    (ok true)))

;; Price oracle functions
(define-read-only (get-twap-price (token-a principal) (token-b principal) (period uint))
  (let ((pool (unwrap! (get-pool token-a token-b) ERR-POOL-NOT-FOUND))
        (current-timestamp block-height)
        (last-timestamp (get last-price-timestamp pool))
        (time-elapsed (- current-timestamp last-timestamp)))
    (ok (/ (- (get cumulative-price-a pool) 
              (get cumulative-price-b pool))
           time-elapsed))))

(define-private (update-price-cumulative (pool-data { token-a: principal, token-b: principal }))
  (let ((pool (unwrap! (get-pool (get token-a pool-data) (get token-b pool-data)) ERR-POOL-NOT-FOUND))
        (price-a (/ (* (get reserve-b pool) u1000000) (get reserve-a pool)))
        (price-b (/ (* (get reserve-a pool) u1000000) (get reserve-b pool)))
        (time-elapsed (- block-height (get last-price-timestamp pool))))
    (merge pool {
      cumulative-price-a: (+ (get cumulative-price-a pool) (* price-a time-elapsed)),
      cumulative-price-b: (+ (get cumulative-price-b pool) (* price-b time-elapsed)),
      last-price-timestamp: block-height
    })))

;; Read-only functions for price calculation
(define-read-only (get-spot-price (token-a principal) (token-b principal))
  (let ((pool (unwrap! (get-pool token-a token-b) ERR-POOL-NOT-FOUND)))
    (ok (/ (* (get reserve-b pool) u1000000) (get reserve-a pool)))))

(define-read-only (get-amount-out (amount-in uint) (token-in principal) (token-out principal))
  (let ((pool (unwrap! (get-pool token-in token-out) ERR-POOL-NOT-FOUND)))
    (ok (calculate-swap-output 
          amount-in 
          (if (is-eq token-in (get token-a pool)) 
              (get reserve-a pool)
              (get reserve-b pool))
          (if (is-eq token-in (get token-a pool))
              (get reserve-b pool)
              (get reserve-a pool))))))

(define-read-only (get-amount-in (amount-out uint) (token-in principal) (token-out principal))
  (let ((pool (unwrap! (get-pool token-in token-out) ERR-POOL-NOT-FOUND)))
    (ok (/ (* amount-out (get reserve-a pool) u1000)
           (* (- (get reserve-b pool) amount-out) u997)))))

;; Pool details
(define-read-only (get-pool (token-a principal) (token-b principal))
  (map-get? pools { token-a: token-a, token-b: token-b }))

;; Calculate tokens out based on constant product formula (x * y = k)
(define-private (calculate-swap-output (amount-in uint) (reserve-in uint) (reserve-out uint))
  (let
    (
      (amount-in-with-fee (mul amount-in u997))  ;; 0.3% fee
      (numerator (mul amount-in-with-fee reserve-out))
      (denominator (add (mul reserve-in u1000) amount-in-with-fee))
    )
    (/ numerator denominator)))

;; Initialize new pool
(define-public (create-pool 
    (token-a principal)
    (token-b principal)
    (initial-a uint)
    (initial-b uint)
    (deadline uint))
  (let
    (
      (pool-exists (is-some (get-pool token-a token-b)))
      (liquidity-token (contract-call? .liquidity-token create-token token-a token-b))
    )
    ;; Validations
    (try! (check-reentrancy))
    (try! (validate-pool-tokens token-a token-b))
    (try! (validate-amounts initial-a initial-b))
    (try! (validate-deadline deadline))
    (asserts! (not pool-exists) ERR-POOL-EXISTS)
    (asserts! (>= (sqrti (mul initial-a initial-b)) MIN-LIQUIDITY) ERR-MIN-LIQUIDITY)
    
    ;; Transfer initial tokens to the pool
    (try! (contract-call? token-a transfer initial-a tx-sender (as-contract tx-sender)))
    (try! (contract-call? token-b transfer initial-b tx-sender (as-contract tx-sender)))
    
    ;; Create pool entry
    (map-set pools
      { token-a: token-a, token-b: token-b }
      { 
        liquidity-token: liquidity-token,
        reserve-a: initial-a,
        reserve-b: initial-b,
        total-liquidity: (sqrti (mul initial-a initial-b)),
        last-block-height: block-height,
        cumulative-price-a: u0,
        cumulative-price-b: u0,
        last-price-timestamp: block-height
      })
    
    ;; Mint initial liquidity tokens
    (try! (as-contract
      (contract-call? .liquidity-token mint 
        (sqrti (mul initial-a initial-b))
        tx-sender)))
    
    ;; Release reentrancy lock
    (try! (release-reentrancy-lock))
    (ok true)))

;; Swap tokens with additional safety
(define-public (swap 
    (token-in principal)
    (amount-in uint)
    (token-out principal)
    (min-out uint)
    (deadline uint))
  (let
    ((pool (unwrap! (get-pool token-in token-out) ERR-POOL-NOT-FOUND))
     (reserve-in (if (is-eq token-in (get token-a pool)) 
                    (get reserve-a pool)
                    (get reserve-b pool)))
     (reserve-out (if (is-eq token-in (get token-a pool))
                     (get reserve-b pool)
                     (get reserve-a pool)))
     (amount-out (calculate-swap-output amount-in reserve-in reserve-out)))
    
    ;; Validations
    (try! (check-reentrancy))
    (try! (validate-deadline deadline))
    (try! (validate-max-in-ratio amount-in reserve-in))
    (asserts! (>= amount-out min-out) ERR-SLIPPAGE-TOO-HIGH)
    
    ;; Transfer tokens
    (try! (contract-call? token-in transfer 
            amount-in
            tx-sender
            (as-contract tx-sender)))
    
    (try! (as-contract
      (contract-call? token-out transfer
        amount-out
        (as-contract tx-sender)
        tx-sender)))
    
    ;; Update pool state
    (let ((updated-pool (update-price-cumulative { token-a: token-in, token-b: token-out })))
      (map-set pools
        { token-a: token-in, token-b: token-out }
        (merge updated-pool {
          reserve-a: (+ reserve-in amount-in),
          reserve-b: (- reserve-out amount-out),
          last-block-height: block-height
        })))
    
    ;; Release reentrancy lock
    (try! (release-reentrancy-lock))
    (ok amount-out)))

;; Add liquidity
(define-public (add-liquidity
    (token-a principal)
    (token-b principal)
    (amount-a-desired uint)
    (amount-b-desired uint)
    (amount-a-min uint)
    (amount-b-min uint)
    (deadline uint))
  (let
    ((pool (unwrap! (get-pool token-a token-b) ERR-POOL-NOT-FOUND))
     (reserve-a (get reserve-a pool))
     (reserve-b (get reserve-b pool))
     (amount-b-optimal (/ (* amount-a-desired reserve-b) reserve-a))
     (amount-a amount-a-desired)
     (amount-b (if (<= amount-b-optimal amount-b-desired)
                   amount-b-optimal
                   (let ((amount-a-optimal (/ (* amount-b-desired reserve-a) reserve-b)))
                     (asserts! (>= amount-a-optimal amount-a-min) ERR-INSUFFICIENT-AMOUNT)
                     amount-b-desired)))
     (total-liquidity (get total-liquidity pool))
     (liquidity-minted (min
       (/ (* amount-a total-liquidity) reserve-a)
       (/ (* amount-b total-liquidity) reserve-b))))
    
    ;; Validations
    (try! (check-reentrancy))
    (try! (validate-amounts amount-a amount-b))
    (try! (validate-deadline deadline))
    (asserts! (>= amount-a amount-a-min) ERR-INSUFFICIENT-AMOUNT)
    (asserts! (>= amount-b amount-b-min) ERR-INSUFFICIENT-AMOUNT)
    
    ;; Transfer tokens
    (try! (contract-call? token-a transfer amount-a tx-sender (as-contract tx-sender)))
    (try! (contract-call? token-b transfer amount-b tx-sender (as-contract tx-sender)))
    
    ;; Update pool
    (let ((updated-pool (update-price-cumulative { token-a: token-a, token-b: token-b })))
      (map-set pools
        { token-a: token-a, token-b: token-b }
        (merge updated-pool {
          reserve-a: (+ reserve-a amount-a),
          reserve-b: (+ reserve-b amount-b),
          total-liquidity: (+ total-liquidity liquidity-minted),
          last-block-height: block-height
        })))
    
    ;; Mint liquidity tokens
    (try! (as-contract
      (contract-call? .liquidity-token mint liquidity-minted tx-sender)))
    
    ;; Release reentrancy lock
    (try! (release-reentrancy-lock))
    (ok liquidity-minted)))

;; Remove liquidity
(define-public (remove-liquidity
    (token-a principal)
    (token-b principal)
    (liquidity uint)
    (min-amount-a uint)
    (min-amount-b uint)
    (deadline uint))
  (let
    ((pool (unwrap! (get-pool token-a token-b) ERR-POOL-NOT-FOUND))
     (total-liquidity (get total-liquidity pool))
     (amount-a (/ (* liquidity (get reserve-a pool)) total-liquidity))
     (amount-b (/ (* liquidity (get reserve-b pool)) total-liquidity)))
    
    ;; Validations
    (try! (check-reentrancy))
    (try! (validate-amounts amount-a amount-b))
    (try! (validate-deadline deadline))
    (asserts! (>= amount-a min-amount-a) ERR-INSUFFICIENT-AMOUNT)
    (asserts! (>= amount-b min-amount-b) ERR-INSUFFICIENT-AMOUNT)
    
    ;; Burn liquidity tokens
    (try! (as-contract 
            (contract-call? .liquidity-token burn liquidity tx-sender)))
    
    ;; Transfer tokens back to user
    (try! (as-contract 
            (contract-call? token-a transfer amount-a (as-contract tx-sender) tx-sender)))
    (try! (as-contract 
            (contract-call? token-b transfer amount-b (as-contract tx-sender) tx-sender)))
    
    ;; Update pool
    (let ((updated-pool (update-price-cumulative { token-a: token-a, token-b: token-b })))
      (map-set pools
        { token-a: token-a, token-b: token-b }
        (merge updated-pool {
          reserve-a: (- (get reserve-a pool) amount-a),
          reserve-b: (- (get reserve-b pool) amount-b),
          total-liquidity: (- total-liquidity liquidity),
          last-block-height: block-height
        })))
    
    ;; Release reentrancy lock
    (try! (release-reentrancy-lock))
    (ok { amount-a: amount-a, amount-b: amount-b })))

;; Flash loan
(define-public (flash-loan
    (token principal)
    (amount uint)
    (recipient principal)
    (deadline uint))
  (let
    ((pool (unwrap! (get-pool token token) ERR-POOL-NOT-FOUND))
     (initial-balance (unwrap-panic (contract-call? token get-balance (as-contract tx-sender))))
     (fee (/ (* amount u3) u1000)))  ;; 0.3% fee
    
    ;; Validations
    (try! (check-reentrancy))
    (try! (validate-deadline deadline))
    (asserts! (> amount u0) ERR-ZERO-AMOUNT)
    
    ;; Transfer tokens to recipient
    (try! (as-contract 
            (contract-call? token transfer amount (as-contract tx-sender) recipient)))
    
    ;; Verify repayment
    (asserts! (>= (unwrap-panic (contract-call? token get-balance (as-contract tx-sender)))
                  (+ initial-balance fee))
              ERR-FLASH-LOAN-FAILED)
    
    ;; Release reentrancy lock
    (try! (release-reentrancy-lock))
    (ok true)))
=======
    reserve-b: uint }
)

;; Initialize new pool
(define-public (create-pool 
  (token-a principal)
  (token-b principal)
  (initial-a uint)
  (initial-b uint))
  (begin
      ;; Add pool creation logic
      (ok true)))

;; Swap tokens
(define-public (swap 
  (token-in principal)
  (amount-in uint)
  (token-out principal)
  (min-out uint))
  (begin
      ;; Add swap logic
      (ok true)))
>>>>>>> origin/main
