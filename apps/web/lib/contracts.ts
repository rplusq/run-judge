export const RUNJUDGE_ADDRESS = '0x16a31ef6A50712212d0702d05c895969b3b58E1f';

export const RUNJUDGE_ABI = [
  {
    inputs: [
      { name: 'startTime', type: 'uint40' },
      { name: 'distance', type: 'uint32' },
      { name: 'entryFee', type: 'uint256' },
    ],
    name: 'createChallenge',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'challengeId', type: 'uint256' }],
    name: 'joinChallenge',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'challengeId', type: 'uint256' },
      { name: 'stravaActivityId', type: 'uint256' },
    ],
    name: 'submitResult',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'challengeId', type: 'uint256' }],
    name: 'challenges',
    outputs: [
      { name: 'startTime', type: 'uint40' },
      { name: 'distance', type: 'uint32' },
      { name: 'entryFee', type: 'uint256' },
      { name: 'isActive', type: 'bool' },
      { name: 'winner', type: 'address' },
      { name: 'totalPrize', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;
